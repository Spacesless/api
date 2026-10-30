import assert = require('node:assert/strict');
import fs = require('node:fs');
import path = require('node:path');
import vm = require('node:vm');
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { test } from 'node:test';
import type { IcibaResponse, IcibaSentence } from '../src/types/data';
import type SentenceController = require('../src/controller/english-sentence');

const root = path.resolve(__dirname, '../..');
process.env.THINK_UNIT_TEST = '1';

// The local, ignored MongoDB configuration is optional for these offline checks.
const errors: unknown[][] = [];
const originalError = console.error;
console.error = (...args: unknown[]) => { errors.push(args); };
try {
  require('../production');
  think.app.emit('appReady');
} finally {
  console.error = originalError;
  delete process.env.THINK_UNIT_TEST;
}
for (const args of errors) {
  const error = args[0] as NodeJS.ErrnoException;
  assert.ok(error.code === 'MODULE_NOT_FOUND' && error.message.includes('adapter.model.js'), String(error));
}

interface LoadedApplication {
  controllers: Record<string, unknown>;
  models: Record<string, unknown>;
  logics: Record<string, unknown>;
}

test('ThinkJS loads every migrated controller, logic and model from the compiled directory', () => {
  const app = think.app as typeof think.app & LoadedApplication;
  for (const [directory, loaded] of [
    ['controller', app.controllers], ['logic', app.logics], ['model', app.models]
  ] as const) {
    const files = fs.readdirSync(path.join(root, 'src', directory), { recursive: true })
      .filter((name): name is string => typeof name === 'string' && name.endsWith('.ts'));
    assert.equal(Object.keys(loaded).length, files.length, directory);
    for (const file of files) {
      const key = file.replace(/\\/g, '/').replace(/\.ts$/, '');
      assert.equal(typeof loaded[key], 'function', key);
    }
  }
  assert.equal(think.ROOT_PATH, root);
  assert.equal(think.APP_PATH, path.join(root, 'app/src'));
  assert.equal(think.ASSETS_PATH, path.join(root, 'www'));
});

test('all documented GET endpoints still have a controller action', () => {
  const app = think.app as typeof think.app & LoadedApplication;
  const document = JSON.parse(fs.readFileSync(path.join(root, 'openapi.json'), 'utf8')) as {
    paths: Record<string, { get?: unknown }>;
  };
  for (const [url, methods] of Object.entries(document.paths)) {
    if (!methods.get) continue;
    const parts = url.slice(1).split('/');
    let matched = false;
    for (let length = parts.length; length > 0; length--) {
      const prefix = parts.slice(0, length).join('/');
      const action = parts[length] || 'index';
      const Controller = (app.controllers[prefix] || app.controllers[`${prefix}/index`]) as
        { prototype: Record<string, unknown> } | undefined;
      if (Controller && typeof Controller.prototype[`${action}Action`] === 'function') matched = true;
    }
    assert.ok(matched, url);
  }
});

function request(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.url = url;
    req.method = 'GET';
    req.headers = { host: 'localhost', 'user-agent': 'migration-test' };
    const res = new ServerResponse(req);
    const timer = setTimeout(() => { socket.destroy(); reject(new Error(`Request timed out: ${url}`)); }, 5000);
    res.end = ((chunk?: string | Buffer) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ status: res.statusCode, body: chunk?.toString() || '' });
      return res;
    }) as typeof res.end;
    think.app.callback()(req, res);
  });
}

test('compiled routes retain validation, response envelopes and local utility behavior', async () => {
  const md5 = await request('/crypto/hash/md5?message=hello');
  assert.equal(md5.status, 200, errors.map(args => String(args[0] instanceof Error ? args[0].stack : args[0])).join('\n'));
  assert.deepEqual(JSON.parse(md5.body), { errno: 0, errmsg: '', data: '5d41402abc4b2a76b9719d911017c592' });

  const pinyin = await request('/pinyin?text=' + encodeURIComponent('中国'));
  assert.equal(JSON.parse(pinyin.body).errno, 0);
  assert.ok(Array.isArray(JSON.parse(pinyin.body).data));

  const time = await request('/time?datetime=2026-10-30');
  const calendar = JSON.parse(time.body);
  assert.equal(calendar.errno, 0);
  assert.equal(calendar.data.year, 2026);
  assert.equal(calendar.data.month, 10);
  assert.equal(calendar.data.day, 30);
  assert.ok(calendar.data.lunar);
  assert.ok(calendar.data.almanac);

  const missing = await request('/crypto/cipher');
  assert.notEqual(JSON.parse(missing.body).errno, 0);
});

async function collect(responses: (IcibaResponse | Error | null)[]) {
  const calls: { url: string; params?: Record<string, string>; timeout: number }[] = [];
  let saved: IcibaSentence | undefined;
  let saveFinished = false;
  class Base {
    mongo() {
      return { addRecord: async (data: IcibaSentence) => {
        await Promise.resolve();
        saved = data;
        saveFinished = true;
        return { _id: 'id', type: 'add' };
      } };
    }
    success() { assert.ok(saveFinished); return true; }
    fail() { return false; }
  }
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'app/src/controller/english-sentence.js'), 'utf8'), {
    module,
    exports: module.exports,
    think: { logger: { warn() {}, debug() {} } },
    require(name: string) {
      if (name === './base') return Base;
      if (name === 'dayjs') return () => ({ format: () => '2026-10-30' });
      if (name === 'axios') return { request: async (config: typeof calls[number]) => {
        calls.push(config);
        const response = responses.shift();
        if (response instanceof Error) throw response;
        return { data: response };
      } };
      throw new Error(`Unexpected module: ${name}`);
    }
  });
  const Controller = module.exports as typeof SentenceController;
  const controller = new Controller({} as ConstructorParameters<typeof Controller>[0]);
  const result = await controller.crontabAction();
  return { result, calls, saved };
}

const primary: IcibaResponse = {
  sid: '6124', dateline: '2026-10-30', content: 'English', note: '中文',
  picture4: 'large', fenxiang_img: 'share'
};
const fallback: IcibaResponse = {
  errno: 0, sid: 6124, title: '2026-10-30', content: 'English', note: '中文',
  picture2: 'middle', picture3: 'small', tts: 'audio'
};

test('collection uses the original API first and waits for the database write', async () => {
  const { result, calls, saved } = await collect([primary]);
  assert.equal(result, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://open.iciba.com/dsapi');
  assert.equal(calls[0].timeout, 10000);
  assert.equal(saved?.fenxiang_img, 'share');
});

test('collection falls back on timeout or invalid data and normalizes the alternate response', async () => {
  for (const invalid of [new Error('timeout'), null, {}, { ...primary, content: '' }, { ...primary, errno: 1 }]) {
    const { result, calls, saved } = await collect([invalid, fallback]);
    assert.equal(result, true);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url, 'https://sentence.iciba.com/index.php');
    assert.equal(calls[1].params?.title, '2026-10-30');
    assert.equal(calls[1].timeout, 10000);
    assert.equal(saved?.sid, '6124');
    assert.equal(saved?.dateline, '2026-10-30');
    assert.equal(saved?.fenxiang_img, null);
    assert.equal(saved?.picture4, null);
    assert.equal(saved?.picture2, 'middle');
    assert.equal(saved?.tts, 'audio');
  }
});

test('collection does not write when both APIs fail', async () => {
  const { result, saved } = await collect([new Error('504'), { errno: 1 }]);
  assert.equal(result, false);
  assert.equal(saved, undefined);
});

test('the MongoDB model maps the alternate source to the existing record fields', async () => {
  let filter: object | undefined;
  let record: Record<string, unknown> | undefined;
  class Mongo {
    where(value: object) { filter = value; return this; }
    async thenAdd(value: Record<string, unknown>) { record = value; return { _id: 'id', type: 'add' }; }
  }
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'app/src/model/english-sentence.js'), 'utf8'), {
    module, exports: module.exports, think: { Mongo }
  });
  const Model = module.exports as typeof import('../src/model/english-sentence');
  const model = new Model('english-sentence');
  const normalized = (await collect([null, fallback])).saved!;
  await model.addRecord(normalized);
  assert.equal(JSON.stringify(filter), JSON.stringify({ date: '2026-10-30' }));
  assert.equal(record?.sid, '6124');
  assert.equal(record?.date, '2026-10-30');
  assert.equal(record?.middlePicture, 'middle');
  assert.equal(record?.smallPicture, 'small');
  assert.equal(record?.sharePicture, null);
  assert.equal(record?.largePicture, null);
  assert.equal(record?.tts, 'audio');
  assert.equal(record?.title, undefined);
});
