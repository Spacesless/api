const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const walk = (node, fn) => { fn(node); node.forEachChild(child => walk(child, fn)); };
const text = node => node?.name?.text;
const tag = (node, name) => ts.getJSDocTags(node).filter(t => t.tagName.text === name)
  .map(t => typeof t.comment === 'string' ? t.comment : '').at(-1);
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: x => x, getCurrentDirectory: () => root, getNewLine: () => '\n'
  }));
  process.exit(1);
}
const checker = program.getTypeChecker();
const sources = program.getSourceFiles().filter(f => !f.isDeclarationFile);
const getClass = file => file.statements.find(ts.isExportAssignment)?.expression;
const schemas = {};
const schemaNames = new Map();
const usedNames = new Set();
const unknowns = new Set();
let operation = '';

function hasDynamic(value, visited = new Set()) {
  if (!value || typeof value !== 'object') return false;
  if (value['x-typescript-type']) return true;
  if (value.$ref) {
    const name = value.$ref.split('/').at(-1);
    if (visited.has(name)) return false;
    return hasDynamic(schemas[name], new Set(visited).add(name));
  }
  return Object.values(value).some(child => hasDynamic(child, visited));
}

function schema(type, active = new Set()) {
  const flags = type.flags;
  if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    unknowns.add(operation);
    return { description: '动态数据：源码类型为 any/unknown，未推断字段结构。', 'x-typescript-type': checker.typeToString(type) };
  }
  if (flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Never)) return {};
  if (flags & ts.TypeFlags.Null) return { nullable: true };
  if (type.isUnion()) {
    const members = type.types.filter(t => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)));
    const nonNull = members.filter(t => !(t.flags & ts.TypeFlags.Null));
    const nullable = nonNull.length !== members.length;
    let result;
    if (!nonNull.length) result = {};
    else if (nonNull.every(t => t.flags & ts.TypeFlags.BooleanLike)) result = { type: 'boolean' };
    else if (nonNull.every(t => t.isStringLiteral())) result = { type: 'string', enum: nonNull.map(t => t.value) };
    else if (nonNull.every(t => t.isNumberLiteral())) result = { type: 'number', enum: nonNull.map(t => t.value) };
    else {
      const variants = [...new Map(nonNull.map(t => { const s = schema(t, active); return [JSON.stringify(s), s]; })).values()];
      result = variants.length === 1 ? variants[0] : { anyOf: variants };
    }
    return nullable ? { ...result, nullable: true } : result;
  }
  if (flags & ts.TypeFlags.StringLike) return { type: 'string', ...(type.isStringLiteral() ? { enum: [type.value] } : {}) };
  if (flags & ts.TypeFlags.NumberLike) return { type: 'number', ...(type.isNumberLiteral() ? { enum: [type.value] } : {}) };
  if (flags & ts.TypeFlags.BooleanLike) return { type: 'boolean' };
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    const args = checker.getTypeArguments(type);
    const items = args.map(t => schema(t, active));
    return { type: 'array', items: !items.length ? {} : items.length === 1 ? items[0] : { anyOf: items } };
  }
  if (type.symbol?.name === 'Date') return { type: 'string', format: 'date-time' };
  if (type.symbol?.name === 'Buffer') return { type: 'string', format: 'binary' };
  if (!(flags & ts.TypeFlags.Object) && !type.isIntersection()) return {};
  if (schemaNames.has(type.id)) {
    const reference = { $ref: '#/components/schemas/' + schemaNames.get(type.id) };
    if (hasDynamic(reference)) unknowns.add(operation);
    return reference;
  }
  const label = type.aliasSymbol?.name || type.symbol?.name;
  const named = label && !label.startsWith('__');
  if (active.has(type.id)) throw new Error('Anonymous recursive type needs a named interface: ' + checker.typeToString(type));
  let name;
  if (named) {
    const base = checker.typeToString(type).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 100);
    name = base;
    let suffix = 2;
    while (usedNames.has(name)) name = base + '_' + suffix++;
    usedNames.add(name);
    schemaNames.set(type.id, name);
    schemas[name] = {};
  }
  const next = new Set(active).add(type.id);
  const properties = {};
  const required = [];
  for (const prop of checker.getPropertiesOfType(type)) {
    const declaration = prop.valueDeclaration || prop.declarations?.[0];
    if (!declaration || checker.getTypeOfSymbolAtLocation(prop, declaration).getCallSignatures().length) continue;
    const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
    const value = schema(propType, next);
    const description = tag(declaration, 'description') || ts.displayPartsToString(prop.getDocumentationComment(checker));
    properties[prop.name] = description ? { ...value, description } : value;
    if (!(prop.flags & ts.SymbolFlags.Optional) && !(propType.isUnion() && propType.types.some(t => t.flags & ts.TypeFlags.Undefined))) required.push(prop.name);
  }
  const index = checker.getIndexTypeOfType(type, ts.IndexKind.String);
  const result = { type: 'object', properties, ...(required.length ? { required } : {}), ...(index ? { additionalProperties: schema(index, next) } : {}) };
  if (name) { schemas[name] = result; return { $ref: '#/components/schemas/' + name }; }
  return result;
}

// Only inspect literal validation declarations; never execute application code or connect to services.
function literal(node) {
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(p => {
    if (!ts.isPropertyAssignment(p)) throw new Error('Unsupported Logic rule: ' + p.getText());
    return [text(p), literal(p.initializer)];
  }));
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return +node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) return -literal(node.operand);
  throw new Error('Dynamic Logic rule needs generator support: ' + node.getText());
}
function logicRules(controller, action) {
  const file = program.getSourceFile(path.join(root, 'src/logic', controller + '.ts'));
  const cls = file && getClass(file);
  if (!cls?.members) return {};
  let scope = {}, rules = {};
  for (const member of cls.members) {
    if (text(member) === 'scope') walk(member, n => { if (ts.isReturnStatement(n) && n.expression) scope = literal(n.expression); });
    if (text(member) === action + 'Action') walk(member, n => {
      if (ts.isBinaryExpression(n) && n.left.getText() === 'this.rules') rules = literal(n.right);
    });
  }
  return { ...scope, ...rules };
}
function allowedMethods(controller, action) {
  const file = program.getSourceFile(path.join(root, 'src/logic', controller + '.ts'));
  const cls = file && getClass(file);
  const member = cls?.members?.find(m => text(m) === action + 'Action');
  let result = ['get'];
  if (member) walk(member, n => {
    if (ts.isBinaryExpression(n) && n.left.getText() === 'this.allowMethods') {
      const methods = literal(n.right);
      result = (Array.isArray(methods) ? methods : methods.split(',')).map(m => m.trim().toLowerCase())
        .filter(m => m !== 'options');
      if (result.some(m => !['get', 'post', 'put', 'patch', 'delete', 'head', 'trace'].includes(m))) throw new Error('Invalid HTTP method for ' + controller);
    }
  });
  return result;
}
function applyRule(value, rule) {
  value = { ...value };
  if (rule.int) {
    value.type = 'integer';
    if (typeof rule.int === 'object') {
      if (rule.int.min !== undefined) value.minimum = rule.int.min;
      if (rule.int.max !== undefined) value.maximum = rule.int.max;
    }
  }
  if (rule.in) value.enum = rule.in;
  if (rule.length?.min !== undefined) value.minLength = rule.length.min;
  if (rule.length?.max !== undefined) value.maxLength = rule.length.max;
  if (rule.ip4) value.format = 'ipv4';
  if (rule.date) value['x-thinkjs-date'] = true;
  if (rule.hexColor) value.pattern = '^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$';
  if (rule.requiredIf) value['x-required-if'] = rule.requiredIf;
  return value;
}

const router = program.getSourceFile(path.join(root, 'src/config/router.ts'));
const aliases = new Map();
walk(router, n => {
  if (ts.isArrayLiteralExpression(n) && n.elements.length >= 2 && n.elements.slice(0, 2).every(ts.isStringLiteral)) {
    const [url, target] = n.elements.map(e => e.text);
    aliases.set(target, url);
  }
});
const paths = {};
for (const file of sources.filter(f => f.fileName.replace(/\\/g, '/').includes('/src/controller/'))) {
  const controller = path.relative(path.join(root, 'src/controller'), file.fileName).replace(/\\/g, '/').replace(/\.ts$/, '');
  const cls = getClass(file);
  if (!cls?.members) continue;
  for (const method of cls.members) {
    if (!ts.isMethodDeclaration(method) || !text(method)?.endsWith('Action')) continue;
    if (ts.getJSDocTags(method).some(t => t.tagName.text === 'internal')) continue;
    const action = text(method).slice(0, -6);
    const canonical = controller.replace(/\/index$/, '') + (action === 'index' ? '' : '/' + action);
    const url = aliases.get(controller + '/' + action) || (action === 'index' && aliases.get(controller)) || '/' + canonical;
    operation = url;
    const queryProps = new Map();
    const queryCalls = [];
    walk(method, node => {
      if (ts.isCallExpression(node) && node.expression.getText() === 'this.getApiQuery') queryCalls.push(node);
    });
    for (const query of queryCalls) {
      if (query.arguments.length || query.typeArguments?.length !== 1) {
        throw new Error('Use this.getApiQuery<BusinessQuery>() in ' + url);
      }
      const type = checker.getTypeFromTypeNode(query.typeArguments[0]);
      for (const prop of checker.getPropertiesOfType(type)) {
        const declaration = prop.valueDeclaration;
        const description = tag(declaration, 'description') || ts.displayPartsToString(prop.getDocumentationComment(checker));
        queryProps.set(prop.name, {
          name: prop.name, in: 'query', required: !(prop.flags & ts.SymbolFlags.Optional),
          ...(description ? { description } : {}), schema: schema(checker.getTypeOfSymbolAtLocation(prop, declaration))
        });
      }
    }
    const results = [];
    let binary, raw, redirect = false, canFail = false;
    walk(method, n => {
      if (ts.isCallExpression(n)) {
        const callee = n.expression.getText();
        if (callee === 'this.get' && n.arguments[0] && ts.isStringLiteral(n.arguments[0])) {
          const name = n.arguments[0].text;
          if (!queryProps.has(name)) queryProps.set(name, { name, in: 'query', required: false, schema: { type: 'string' } });
        }
        if (callee === 'this.success') results.push({ type: 'object', required: ['errno', 'errmsg', ...(n.arguments.length ? ['data'] : [])], properties: {
          errno: { type: 'integer', enum: [0] }, errmsg: { type: 'string' },
          ...(n.arguments.length ? { data: schema(checker.getTypeAtLocation(n.arguments[0])) } : {})
        } });
        if (callee === 'this.fail') canFail = true;
        if (callee === 'this.ctx.redirect') redirect = true;
      }
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && n.left.getText() === 'this.body') {
        const type = checker.getTypeAtLocation(n.right);
        if (type.symbol?.name === 'Buffer') binary = { type: 'string', format: 'binary' };
        else raw = schema(type);
      }
    });
    const rules = logicRules(controller, action);
    for (const [name, rule] of Object.entries(rules)) {
      const parameter = queryProps.get(name) || { name, in: 'query', required: false, schema: { type: 'string' } };
      if (rule.required !== undefined) parameter.required = !!rule.required;
      parameter.schema = applyRule(parameter.schema, rule);
      queryProps.set(name, parameter);
    }
    const responses = {};
    const content = {};
    if (results.length) content['application/json'] = { schema: results.length === 1 ? results[0] : { anyOf: results } };
    if (raw) content['application/json'] = { schema: raw };
    if (binary) content['image/png'] = { schema: binary };
    if (Object.keys(content).length) responses['200'] = { description: '成功响应', content };
    if (redirect) responses['302'] = { description: '重定向到图片地址', headers: { Location: { schema: { type: 'string' } } } };
    if (canFail || Object.keys(rules).length) {
      const failure = { type: 'object', required: ['errno', 'errmsg'], properties: { errno: { type: 'integer' }, errmsg: { anyOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }] } } };
      const response = responses['200'] ||= { description: '业务响应', content: {} };
      const json = response.content['application/json'];
      response.content['application/json'] = { schema: json ? { anyOf: [json.schema, failure] } : failure };
    }
    if (!Object.keys(responses).length) throw new Error('No response inferred for ' + url + '; add a typed response or mark action @internal.');
    if (paths[url]) throw new Error('Duplicate API route: ' + url);
    const definition = {
      summary: tag(method, 'summary') || ts.displayPartsToString(method.name && checker.getSymbolAtLocation(method.name)?.getDocumentationComment(checker)) || url,
      ...(tag(method, 'description') ? { description: tag(method, 'description') } : {}),
      operationId: controller.replace(/\//g, '_') + '_' + action,
      tags: [canonical.split('/')[0]], parameters: [...queryProps.values()], responses
    };
    paths[url] = Object.fromEntries(allowedMethods(controller, action).map(method => [method, definition]));
  }
}
const document = { openapi: '3.0.1', info: { title: '公共 API', version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
  description: '从 Controller、TypeScript 类型和 Logic 校验规则自动生成。' },
  servers: [{ url: '/', description: '当前部署' }], paths,
  components: { schemas } };
const output = JSON.stringify(document, null, 2) + '\n';
const destination = path.join(root, 'www', 'swagger', 'openapi.json');
fs.mkdirSync(path.dirname(destination), { recursive: true });
if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== output) fs.writeFileSync(destination, output);
console.log('OpenAPI: generated ' + Object.keys(paths).length + ' endpoints.');
if (unknowns.size) console.warn('OpenAPI: dynamic fields remain in ' + [...unknowns].join(', ') + '. Add concrete TypeScript types to describe them.');

