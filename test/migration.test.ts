import type { IcibaResponse, IcibaSentence } from '../src/types/english-sentence';
import assert = require('node:assert/strict');
import fs = require('node:fs');
import path = require('node:path');
import vm = require('node:vm');
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { test } from 'node:test';

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
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8')) as {
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

function request(url: string, method = 'GET'): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.url = url;
    req.method = method;
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

test('home renders project documentation and the generated OpenAPI document exists', async () => {
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.ok(home.body.includes('SwaggerUIBundle'));
  assert.ok(!home.body.includes('apifox.cn'));
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www', 'swagger', 'openapi.json'), 'utf8'));
  assert.equal(document.paths['/qrcode'].get.responses['200'].content['image/png'].schema.format, 'binary');
  assert.ok(document.paths['/bing'].get.responses['302']);
  assert.ok(!document.paths['/bing/crontab']);
  for (const endpoint of ['/poetry', '/poetry/writer', '/poetry/sentence', '/dictionary/word', '/dictionary/xiehouyu', '/dictionary/couplet']) {
    assert.ok(!document.paths[endpoint].get.parameters.some((parameter: { name: string }) => parameter.name === 'id'), endpoint);
  }
});

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

async function queryCollection(controllerName: 'poetry' | 'dictionary', action: string, query: Record<string, unknown>, records: unknown[] = []) {
  const captured: { collection?: string; where?: unknown; order?: string; page?: unknown[] } = {};
  const result = { count: records.length, totalPages: records.length ? 1 : 0, pageSize: 10, currentPage: 1, data: records };
  const model = {
    where(value: unknown) { captured.where = value; return this; },
    order(value: string) { captured.order = value; return this; },
    page(...value: unknown[]) { captured.page = value; return this; },
    async countSelect() { return result; }
  };
  class Base {
    getApiQuery() { return query; }
    mongo(name: string) { captured.collection = name; return model; }
    success(value: unknown) { return value; }
  }
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, `app/src/controller/${controllerName}.js`), 'utf8'), {
    module, exports: module.exports,
    require(name: string) {
      if (name === './base') return Base;
      throw new Error(`Unexpected module: ${name}`);
    }
  });
  const Controller = module.exports as new (context: object) => Record<string, () => Promise<unknown>>;
  const controller = new Controller({});
  assert.equal(await controller[action](), result);
  return JSON.parse(JSON.stringify(captured)) as typeof captured;
}

test('poetry searches use source fields, separate collections, literal search and stable pagination', async () => {
  const poem = await queryCollection('poetry', 'indexAction', {
    author: '李白', dynasty: '唐代', type: '乐府', keyword: '[将进酒].*', page: 2, pageSize: 5
  });
  assert.equal(poem.collection, 'poetry_guwen');
  assert.equal(poem.order, '_id ASC');
  assert.deepEqual(poem.page, [2, 5]);
  assert.deepEqual(poem.where, {
    writer: { $regex: '李白' }, dynasty: '唐代', type: '乐府',
    $or: [
      { title: { $regex: '\\[将进酒\\]\\.\\*' } },
      { content: { $regex: '\\[将进酒\\]\\.\\*' } },
      { type: { $regex: '\\[将进酒\\]\\.\\*' } }
    ]
  });

  const writer = await queryCollection('poetry', 'writerAction', { name: '李白', keyword: '诗仙' });
  assert.equal(writer.collection, 'poetry_writer');
  assert.deepEqual(writer.page, [1, 10]);
  assert.deepEqual(writer.where, { name: { $regex: '李白' }, $or: [{ name: { $regex: '诗仙' } }, { simpleIntro: { $regex: '诗仙' } }] });

  const sentence = await queryCollection('poetry', 'sentenceAction', { from: '李白《将进酒》', keyword: '天生我材' });
  assert.equal(sentence.collection, 'poetry_sentence');
  assert.deepEqual(sentence.where, { from: { $regex: '李白《将进酒》' }, $or: [{ name: { $regex: '天生我材' } }, { from: { $regex: '天生我材' } }] });

  for (const action of ['indexAction', 'writerAction', 'sentenceAction'] as const) {
    const empty = await queryCollection('poetry', action, {});
    assert.deepEqual(empty.where, {});
    assert.deepEqual(empty.page, [1, 10]);
  }
});

test('dictionary queries match source formats, original glyphs and both halves of a xiehouyu', async () => {
  const word = await queryCollection('dictionary', 'wordAction', {
    word: '樂', radicals: '丿', strokes: 5, keyword: '[音乐].*', page: 2, pageSize: 5
  });
  assert.equal(word.collection, 'dictionary_word');
  assert.equal(word.order, '_id ASC');
  assert.deepEqual(word.page, [2, 5]);
  assert.deepEqual(word.where, {
    radicals: '丿', strokes: '5',
    $and: [
      { $or: [{ word: '樂' }, { oldword: '樂' }] },
      { $or: [
        { word: { $regex: '\\[音乐\\]\\.\\*' } },
        { oldword: { $regex: '\\[音乐\\]\\.\\*' } },
        { explanation: { $regex: '\\[音乐\\]\\.\\*' } }
      ] }
    ]
  });
  const xiehouyu = await queryCollection('dictionary', 'xiehouyuAction', {
    riddle: '飞机', answer: '高谈阔论', keyword: '(聊天)'
  });
  assert.equal(xiehouyu.collection, 'dictionary_xiehouyu');
  assert.deepEqual(xiehouyu.where, {
    riddle: { $regex: '飞机' }, answer: { $regex: '高谈阔论' },
    $or: [{ riddle: { $regex: '\\(聊天\\)' } }, { answer: { $regex: '\\(聊天\\)' } }]
  });
  for (const action of ['wordAction', 'xiehouyuAction']) {
    const empty = await queryCollection('dictionary', action, {});
    assert.deepEqual(empty.where, {});
    assert.deepEqual(empty.page, [1, 10]);
  }
});

test('dictionary routes reject invalid pagination and stroke counts before accessing MongoDB', async () => {
  for (const endpoint of ['/dictionary/word', '/dictionary/xiehouyu', '/dictionary/couplet']) {
    const invalidQueries = ['page=0', 'pageSize=51', 'keyword=' + 'x'.repeat(101)];
    for (const query of invalidQueries) {
      const result = JSON.parse((await request(endpoint + '?' + query)).body);
      assert.notEqual(result.errno, 0, endpoint + '?' + query);
    }
    const post = JSON.parse((await request(endpoint, 'POST')).body);
    assert.equal(post.errmsg, 'METHOD_NOT_ALLOWED');
  }
  for (const strokes of ['0', '101', '1.5', 'abc']) {
    const result = JSON.parse((await request('/dictionary/word?strokes=' + strokes)).body);
    assert.notEqual(result.errno, 0, strokes);
  }
});

test('couplet queries retrieve existing pairs, preserve multiple answers and treat keywords literally', async () => {
  const pairs = [
    { _id: '1', up: '同一上联', down: '已有下联之一' },
    { _id: '2', up: '同一上联', down: '已有下联之二' }
  ];
  const byUpper = await queryCollection('dictionary', 'coupletAction', { up: '同一上联', page: 2, pageSize: 5 }, pairs);
  assert.equal(byUpper.collection, 'dictionary_couplet');
  assert.equal(byUpper.order, '_id ASC');
  assert.deepEqual(byUpper.page, [2, 5]);
  assert.deepEqual(byUpper.where, { up: '同一上联' });

  const reverse = await queryCollection('dictionary', 'coupletAction', { down: '晨露润花花更红' });
  assert.deepEqual(reverse.where, { down: '晨露润花花更红' });

  const combined = await queryCollection('dictionary', 'coupletAction', {
    up: '[上联].*', down: '下联', keyword: '(春)'
  });
  assert.deepEqual(combined.where, {
    up: '[上联].*', down: '下联',
    $or: [{ up: { $regex: '\\(春\\)' } }, { down: { $regex: '\\(春\\)' } }]
  });
  const empty = await queryCollection('dictionary', 'coupletAction', {});
  assert.deepEqual(empty.where, {});
  assert.deepEqual(empty.page, [1, 10]);

  for (const field of ['up', 'down']) {
    const result = JSON.parse((await request('/dictionary/couplet?' + field + '=' + 'x'.repeat(101))).body);
    assert.notEqual(result.errno, 0);
  }
});

test('poetry routes reject invalid pagination, search lengths and HTTP methods before querying MongoDB', async () => {
  for (const endpoint of ['/poetry', '/poetry/writer', '/poetry/sentence']) {
    for (const query of ['page=0', 'pageSize=51', 'pageSize=1.5', 'keyword=' + 'x'.repeat(101)]) {
      const result = JSON.parse((await request(endpoint + '?' + query)).body);
      assert.notEqual(result.errno, 0, endpoint + '?' + query);
    }
    const post = JSON.parse((await request(endpoint, 'POST')).body);
    assert.equal(post.errmsg, 'METHOD_NOT_ALLOWED');
  }
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
