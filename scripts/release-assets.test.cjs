const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

for (const state of ['missing', 'empty', 'populated']) {
  test('release packaging leaves Spine external when local directory is ' + state, t => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'api-assets-test-'));
    t.after(() => {
      const resolved = fs.realpathSync(temporary);
      assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
      assert.ok(path.basename(resolved).startsWith('api-assets-test-'));
      fs.rmSync(resolved, { recursive: true });
    });
    const put = (relative, content) => {
      const file = path.join(temporary, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
    };
    put('scripts/release-assets.cjs', fs.readFileSync(path.join(__dirname, 'release-assets.cjs')));
    put('README.md', '# Shared README\n');
    put('www/api_bson_mongodb_data.7z', 'manual database backup');
    put('www/ip2region/test.xdb', 'ip fixture');
    put('www/live2d-assets/models.json', '[]');
    put('www/pet-images/test.webp', 'image fixture');
    if (state !== 'missing') fs.mkdirSync(path.join(temporary, 'www/azurlane-assets/spine'), { recursive: true });
    if (state === 'populated') put('www/azurlane-assets/spine/model/model.skel', 'skeleton fixture');
    put('deploy/release-assets/manual.archive.gz', 'manual database export');
    const run = (command, ...args) => execFileSync(process.execPath, ['scripts/release-assets.cjs', command, ...args], { cwd: temporary, encoding: 'utf8', stdio: 'pipe' });
    assert.match(run('pack'), /Verified:/);
    const output = path.join(temporary, 'deploy/release-assets');
    const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
    const spine = manifest.assets.find(asset => asset.name === 'azurlane-spine.tar.gz');
    const sums = fs.readFileSync(path.join(output, 'SHA256SUMS.txt'), 'utf8');
    assert.ok(manifest.assets.every(asset => ['tar.gz', '7z'].includes(asset.format)));
    const database = manifest.assets.find(asset => asset.name === 'api_bson_mongodb_data.7z');
    assert.ok(database);
    assert.equal(database.files[0].path, 'www/api_bson_mongodb_data.7z');
    assert.equal(fs.readFileSync(path.join(output, database.name), 'utf8'), 'manual database backup');
    assert.ok(sums.includes(database.name));
    assert.ok(!sums.includes('manual.archive.gz'));
    assert.equal(fs.readFileSync(path.join(output, 'manual.archive.gz'), 'utf8'), 'manual database export');
    assert.equal(spine, undefined);
    assert.ok(!sums.includes('azurlane-spine.tar.gz'));
    assert.equal(fs.readFileSync(path.join(output, 'README.md'), 'utf8'), '# Shared README\n');
    if (state === 'populated') assert.equal(fs.readFileSync(path.join(temporary, 'www/azurlane-assets/spine/model/model.skel'), 'utf8'), 'skeleton fixture');
    assert.match(run('install'), /Already installed:/);
    const ipDirectory = path.resolve(temporary, 'www/ip2region');
    assert.ok(fs.realpathSync(ipDirectory).startsWith(fs.realpathSync(temporary) + path.sep));
    fs.rmSync(ipDirectory, { recursive: true });
    assert.match(run('install', '--only', 'ip2region.tar.gz'), /Installed: www\/ip2region/);
    assert.equal(fs.readFileSync(path.join(ipDirectory, 'test.xdb'), 'utf8'), 'ip fixture');
    fs.writeFileSync(path.join(ipDirectory, 'test.xdb'), 'custom data');
    assert.throws(() => run('install'), /--overwrite/);
    assert.equal(fs.readFileSync(path.join(ipDirectory, 'test.xdb'), 'utf8'), 'custom data');
    run('install', '--overwrite');
    const backups = fs.readdirSync(path.join(temporary, 'deploy/resource-backups'));
    assert.equal(fs.readFileSync(path.join(temporary, 'deploy/resource-backups', backups[0], 'www/ip2region/test.xdb'), 'utf8'), 'custom data');
    assert.equal(fs.readFileSync(path.join(ipDirectory, 'test.xdb'), 'utf8'), 'ip fixture');
    fs.appendFileSync(path.join(output, 'ip2region.tar.gz'), 'corrupt');
    assert.throws(() => run('install'), /附件校验失败/);

  });
}

for (const malicious of ['link', 'traversal']) {
  test('resource installer rejects archive ' + malicious + ' before touching local files', t => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'api-assets-test-'));
    t.after(() => {
      const resolved = fs.realpathSync(temporary);
      assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
      assert.ok(path.basename(resolved).startsWith('api-assets-test-'));
      fs.rmSync(resolved, { recursive: true });
    });
    const scripts = path.join(temporary, 'scripts');
    const output = path.join(temporary, 'deploy/release-assets');
    fs.mkdirSync(scripts, { recursive: true });
    fs.mkdirSync(output, { recursive: true });
    fs.mkdirSync(path.join(temporary, 'www/ip2region'), { recursive: true });
    fs.writeFileSync(path.join(temporary, 'www/ip2region/keep.xdb'), 'original');
    fs.copyFileSync(path.join(__dirname, 'release-assets.cjs'), path.join(scripts, 'release-assets.cjs'));
    const header = Buffer.alloc(512);
    const name = malicious === 'link' ? 'www/ip2region/escape.xdb' : 'www/ip2region/../../escape.xdb';
    header.write(name, 0, 100);
    for (const [offset, length, value] of [[100, 8, 420], [108, 8, 0], [116, 8, 0], [124, 12, 0], [136, 12, 0]]) header.write(value.toString(8).padStart(length - 1, '0') + '\0', offset, length);
    header.fill(' ', 148, 156);
    header.write(malicious === 'link' ? '2' : '0', 156);
    if (malicious === 'link') header.write('../../escape.xdb', 157, 100);
    header.write('ustar\0', 257, 6);
    header.write('00', 263, 2);
    header.write([...header].reduce((a, b) => a + b, 0).toString(8).padStart(6, '0') + '\0 ', 148, 8);
    const archive = zlib.gzipSync(Buffer.concat([header, Buffer.alloc(1024)]));
    const hash = value => crypto.createHash('sha256').update(value).digest('hex');
    const manifest = JSON.stringify({ assets: [{ name: 'ip2region.tar.gz', files: [{ path: name, sha256: hash('') }] }] });
    fs.writeFileSync(path.join(output, 'ip2region.tar.gz'), archive);
    fs.writeFileSync(path.join(output, 'manifest.json'), manifest);
    fs.writeFileSync(path.join(output, 'SHA256SUMS.txt'), hash(archive) + '  ip2region.tar.gz\n' + hash(manifest) + '  manifest.json\n');
    assert.throws(() => execFileSync(process.execPath, ['scripts/release-assets.cjs', 'install', '--overwrite'], { cwd: temporary, encoding: 'utf8', stdio: 'pipe' }), /链接|不安全/);
    assert.equal(fs.readFileSync(path.join(temporary, 'www/ip2region/keep.xdb'), 'utf8'), 'original');
    assert.ok(!fs.existsSync(path.join(temporary, 'www/escape.xdb')));
  });
}
