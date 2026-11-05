const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'deploy', 'release-assets');
const bundles = [
  { name: 'api_bson_mongodb_data.7z', source: 'www/api_bson_mongodb_data.7z', format: '7z', description: '手动导出的数据库备份，原样分发，数据库由部署者手动恢复。' },
  { name: 'ip2region.tar.gz', source: 'www/ip2region', format: 'tar.gz', description: 'IP归属查询所需IPv4和IPv6数据库。' },
  { name: 'live2d-assets.tar.gz', source: 'www/live2d-assets', format: 'tar.gz', description: 'Live2D模型、贴图、动作和清单；沿用原项目勿作商用的说明。' },
  { name: 'pet-images.tar.gz', source: 'www/pet-images', format: 'tar.gz', description: '宠物接口引用的本地图片。' }
];

async function sha256(file) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

function filesAt(relative) {
  const absolute = path.join(root, relative);
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink()) throw new Error('不打包符号链接: ' + relative);
  if (stat.isFile()) return [relative];
  return fs.readdirSync(absolute).sort().flatMap(name => filesAt(relative + '/' + name));
}

function tar(args) {
  const result = spawnSync('tar', args, { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || 'tar执行失败');
  return result.stdout;
}

async function pack(args = []) {
  if (args.length) throw new Error('用法: npm run assets:pack');
  // 全部输入先检查，避免缺资源时输出一套不完整的发布包。
  const sources = bundles.flatMap(bundle => {
    if (bundle.optional && !fs.existsSync(path.join(root, bundle.source))) {
      console.log('Skipped optional asset (directory missing): ' + bundle.source);
      return [];
    }
    const files = filesAt(bundle.source);
    if (!files.length) {
      if (!bundle.optional) throw new Error('资源目录为空: ' + bundle.source);
      console.log('Skipped optional asset (directory empty): ' + bundle.source);
      return [];
    }
    return [{ ...bundle, files }];
  });
  fs.mkdirSync(output, { recursive: true });
  const manifest = { schemaVersion: 1, repository: 'Spacesless/api', sourceCommit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).stdout.trim(), assets: [] };
  for (const bundle of sources) {
    const destination = path.join(output, bundle.name);
    if (bundle.format === '7z') fs.copyFileSync(path.join(root, bundle.source), destination);
    else tar(['-czf', destination, '-C', root, bundle.source]);
    const files = [];
    for (const relative of bundle.files) files.push({ path: relative, bytes: fs.statSync(path.join(root, relative)).size, sha256: await sha256(path.join(root, relative)) });
    manifest.assets.push({ name: bundle.name, format: bundle.format, description: bundle.description, bytes: fs.statSync(destination).size, sha256: await sha256(destination), files });
    console.log(bundle.name + ': ' + files.length + ' files, ' + fs.statSync(destination).size + ' bytes');
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.copyFileSync(path.join(root, 'README.md'), path.join(output, 'README.md'));
  const checksums = [];
  for (const name of [...manifest.assets.map(asset => asset.name), 'manifest.json', 'README.md']) checksums.push(await sha256(path.join(output, name)) + '  ' + name);
  fs.writeFileSync(path.join(output, 'SHA256SUMS.txt'), checksums.join('\n') + '\n');
  await verify();
}

async function verify() {
  const checksums = fs.readFileSync(path.join(output, 'SHA256SUMS.txt'), 'utf8').trim().split(/\r?\n/);
  for (const line of checksums) {
    const match = /^([a-f0-9]{64})  ([\w.-]+)$/.exec(line);
    if (!match || await sha256(path.join(output, match[2])) !== match[1]) throw new Error('附件校验失败: ' + line);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
  const temporary = fs.mkdtempSync(path.join(output, '.verify-'));
  try {
    for (const asset of manifest.assets) {
      if (asset.format !== 'tar.gz') continue;
      // 解压前拒绝绝对路径、上级目录及不在对应资源目录内的成员。
      const expected = bundles.find(bundle => bundle.name === asset.name);
      if (!expected) throw new Error('未知附件: ' + asset.name);
      for (const member of tar(['-tzf', path.join(output, asset.name)]).trim().split(/\r?\n/)) {
        if (!member.startsWith(expected.source + '/') || member.split('/').includes('..') || member.includes('\\')) throw new Error('不安全的归档路径: ' + member);
      }
      tar(['-xzf', path.join(output, asset.name), '-C', temporary]);
      for (const file of asset.files) {
        const restored = path.resolve(temporary, file.path);
        if (!restored.startsWith(temporary + path.sep)) throw new Error('不安全的清单路径');
        if (await sha256(restored) !== file.sha256) throw new Error('解压内容不一致: ' + file.path);
      }
    }
  } finally {
    // 删除前确认最终绝对路径位于本次输出目录，且只清理本次创建的临时目录。
    const resolved = fs.realpathSync(temporary);
    if (path.dirname(resolved) !== fs.realpathSync(output) || !path.basename(resolved).startsWith('.verify-')) throw new Error('拒绝清理输出目录外的路径');
    fs.rmSync(resolved, { recursive: true });
  }
  console.log('Verified: attachment SHA256 and extracted resource files.');
}

function relativePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.includes(':') || value.startsWith('/') || value.split('/').some(part => part === '..' || part === '.')) throw new Error('不安全的相对路径: ' + value);
  return value;
}

/** 拒绝部署目录中的符号链接或junction，防止写入项目目录外。 */
function targetPath(base, relative) {
  relativePath(relative);
  let current = base;
  for (const part of relative.split('/').filter(Boolean)) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error('目标路径包含链接: ' + relative);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return current;
}

function cleanup(temporary, parent) {
  const resolved = fs.realpathSync(temporary);
  if (path.dirname(resolved) !== fs.realpathSync(parent) || !path.basename(resolved).startsWith('.install-')) throw new Error('拒绝清理临时目录外的路径');
  fs.rmSync(resolved, { recursive: true });
}

async function checkAttachment(directory, name) {
  if (!/^[\w.-]+$/.test(name)) throw new Error('不安全的附件名');
  const lines = fs.readFileSync(path.join(directory, 'SHA256SUMS.txt'), 'utf8').split(/\r?\n/);
  const entries = lines.map(line => /^([a-f0-9]{64})  ([\w.-]+)$/.exec(line)).filter(Boolean);
  const matched = entries.filter(entry => entry[2] === name);
  if (matched.length !== 1 || await sha256(path.join(directory, name)) !== matched[0][1]) throw new Error('附件校验失败: ' + name);
}

async function install(args) {
  targetPath(root, 'deploy/release-assets');
  let only;
  let overwrite = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--overwrite') overwrite = true;
    else if (args[i] === '--only' && args[i + 1]) only = args[++i];
    else throw new Error('用法: npm run assets:install -- [--only 附件名] [--overwrite]');
  }
  const staticBundles = bundles.filter(bundle => bundle.format === 'tar.gz');
  if (only && !staticBundles.some(bundle => bundle.name === only)) throw new Error('未知静态附件: ' + only);
  const selected = staticBundles.filter(bundle => (!only || bundle.name === only) && fs.existsSync(path.join(output, bundle.name)));
  if (!selected.length) throw new Error('没有可安装的静态附件，请先下载到deploy/release-assets');
  await checkAttachment(output, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
  const temporary = fs.mkdtempSync(path.join(output, '.install-'));
  const plans = [];
  try {
    for (const bundle of selected) {
      await checkAttachment(output, bundle.name);
      const assets = manifest.assets.filter(asset => asset.name === bundle.name);
      if (assets.length !== 1 || !assets[0].files.length) throw new Error('附件清单缺失或重复: ' + bundle.name);
      const asset = assets[0];
      // 先检查归档路径和成员类型，再解压到独立临时目录。
      const members = tar(['-tzf', path.join(output, bundle.name)]).trim().split(/\r?\n/);
      for (const member of members) {
        relativePath(member);
        if (!member.startsWith(bundle.source + '/')) throw new Error('归档路径不属于资源目录: ' + member);
      }
      if (tar(['-tvzf', path.join(output, bundle.name)]).trim().split(/\r?\n/).some(line => !/^[d-]/.test(line))) throw new Error('归档包含链接或特殊文件: ' + bundle.name);
      const staging = fs.mkdtempSync(path.join(temporary, 'asset-'));
      tar(['-xzf', path.join(output, bundle.name), '-C', staging]);
      const expected = new Set();
      let same = true;
      for (const file of asset.files) {
        relativePath(file.path);
        if (!file.path.startsWith(bundle.source + '/') || expected.has(file.path)) throw new Error('资源清单路径不正确: ' + file.path);
        expected.add(file.path);
        const extracted = targetPath(staging, file.path);
        if (!fs.lstatSync(extracted).isFile() || await sha256(extracted) !== file.sha256) throw new Error('资源内容校验失败: ' + file.path);
        const destination = targetPath(root, file.path);
        if (!fs.existsSync(destination) || !fs.lstatSync(destination).isFile() || await sha256(destination) !== file.sha256) same = false;
      }
      const extractedFiles = [];
      const collect = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
          const file = path.join(directory, entry.name);
          if (entry.isDirectory()) collect(file);
          else if (entry.isFile()) extractedFiles.push(path.relative(staging, file).split(path.sep).join('/'));
          else throw new Error('解压内容包含特殊文件');
        }
      };
      collect(staging);
      if (extractedFiles.length !== expected.size || extractedFiles.some(file => !expected.has(file))) throw new Error('归档包含清单外文件');
      const destination = targetPath(root, bundle.source);
      if (fs.existsSync(destination)) {
        const current = filesAt(bundle.source);
        same = same && current.length === expected.size && current.every(file => expected.has(file));
        if (!same && !overwrite) throw new Error('已有资源不同，未修改任何资源；使用--overwrite备份旧目录后更新: ' + bundle.source);
      } else same = false;
      plans.push({ bundle, destination, extracted: targetPath(staging, bundle.source), same });
    }
    // 所有包校验并完成冲突检查后，才开始安装。
    const backupRoot = targetPath(root, 'deploy/resource-backups/' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex'));
    for (const plan of plans) {
      if (plan.same) { console.log('Already installed: ' + plan.bundle.source); continue; }
      let previous;
      if (fs.existsSync(plan.destination)) {
        previous = path.join(backupRoot, plan.bundle.source);
        fs.mkdirSync(path.dirname(previous), { recursive: true });
        fs.renameSync(plan.destination, previous);
        console.log('Previous resources saved: ' + path.relative(root, previous));
      }
      try {
        fs.mkdirSync(path.dirname(plan.destination), { recursive: true });
        fs.renameSync(plan.extracted, plan.destination);
      } catch (error) {
        if (previous) fs.renameSync(previous, plan.destination);
        throw error;
      }
      console.log('Installed: ' + plan.bundle.source);
    }
  } finally { cleanup(temporary, output); }
  console.log('Static resources ready. Restart Node after updating IP data.');
}

module.exports = { root, output, bundles, sha256, checkAttachment, relativePath, targetPath, pack };
if (require.main === module) {
  const command = process.argv[2] || 'pack';
  const args = process.argv.slice(3);
  const run = command === 'pack' ? () => pack(args) : command === 'install' ? () => install(args) : () => { throw new Error('用法: node scripts/release-assets.cjs [pack|install]'); };
  Promise.resolve().then(run).catch(error => { console.error(error.message); process.exitCode = 1; });
}
