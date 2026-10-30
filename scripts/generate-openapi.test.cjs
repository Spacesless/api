const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const generator = path.join(__dirname, 'generate-openapi.cjs');

test('code changes regenerate parameters, constraints, response fields and routes without an existing document', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'api-docs-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  };
  put('package.json', '{"version":"1.0.0"}');
  put('tsconfig.json', JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'CommonJS', types: [], skipLibCheck: true }, include: ['src/**/*.ts'] }));
  put('src/config/router.ts', 'export = [["/sample", "sample/index"]];');
  put('src/types/common.ts', 'export interface PaginationQuery { /** Page size */ limit?: number; }');
  put('src/types/sample.ts', "import type { PaginationQuery } from './common'; export interface SampleQuery extends PaginationQuery { /** Search word */ word?: string; }");
  const controller = `
    import type { SampleQuery } from '../types/sample';
    export = class {
      getApiQuery<T extends object>(): T { return {} as T; }
      success<T>(data: T) { return data; }
      /** @summary Sample endpoint */
      indexAction() { const query = this.getApiQuery<SampleQuery>(); return this.success({ title: 'hello', count: 2 }); }
      /** @internal */
      updateAction() { return this.success('hidden'); }
    };
  `;
  put('src/controller/sample.ts', controller);
  const logic = max => `export = class { rules = {}; indexAction() { this.rules = { word: { required: true, length: { max: ${max} } } }; } };`;
  put('src/logic/sample.ts', logic(10));
  const generate = () => {
    execFileSync(process.execPath, [generator, root], { stdio: 'pipe' });
    return JSON.parse(fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8'));
  };
  const initial = generate();
  assert.deepEqual(Object.keys(initial.paths), ['/sample']);
  assert.equal(initial.paths['/sample'].get.summary, 'Sample endpoint');
  assert.equal(initial.paths['/sample'].get.parameters[0].required, true);
  assert.equal(initial.paths['/sample'].get.parameters[0].schema.maxLength, 10);
  assert.equal(initial.paths['/sample'].get.parameters.find(p => p.name === 'limit').schema.type, 'number');
  const success = initial.paths['/sample'].get.responses['200'].content['application/json'].schema.anyOf[0];
  assert.deepEqual(Object.keys(success.properties.data.properties), ['title', 'count']);

  put('src/controller/sample.ts', controller.replace("count: 2", "enabled: true"));
  put('src/types/sample.ts', 'import type { PaginationQuery } from "./common"; export interface SampleQuery extends PaginationQuery { word?: string; status?: "new" | "old"; }');
  put('src/logic/sample.ts', logic(20));
  const changed = generate();
  const get = changed.paths['/sample'].get;
  assert.equal(get.parameters[0].schema.maxLength, 20);
  assert.deepEqual(get.parameters[1].schema.enum, ['new', 'old']);
  const properties = get.responses['200'].content['application/json'].schema.anyOf[0].properties.data.properties;
  assert.equal(properties.enabled.type, 'boolean');
  assert.ok(!('count' in properties));
  const output = fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8');
  generate();
  assert.equal(fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8'), output);
  assert.ok(!fs.existsSync(path.join(root, 'src/types/openapi.d.ts')));

  put('src/config/router.ts', 'export = [["/renamed", "sample/index"]];');
  const renamed = generate();
  assert.ok(renamed.paths['/renamed']);
  assert.ok(!renamed.paths['/sample']);

  put('src/logic/sample.ts', logic(20).replace('rules = {};', 'rules = {}; allowMethods = "";').replace('this.rules =', 'this.allowMethods = "post,options"; this.rules ='));
  const post = generate();
  assert.ok(post.paths['/renamed'].post);
  assert.ok(!post.paths['/renamed'].get);

  const previous = fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8');
  put('src/controller/sample.ts', controller.replace('getApiQuery<SampleQuery>()', 'getApiQuery()'));
  const missingType = spawnSync(process.execPath, [generator, root], { encoding: 'utf8' });
  assert.notEqual(missingType.status, 0);
  assert.ok(missingType.stderr.includes('Use this.getApiQuery<BusinessQuery>()'));
  assert.equal(fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8'), previous);

  put('src/controller/sample.ts', controller.replace("count: 2", "count: missingVariable"));
  const failed = spawnSync(process.execPath, [generator, root], { encoding: 'utf8' });
  assert.notEqual(failed.status, 0);
  assert.equal(fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8'), previous);
});
