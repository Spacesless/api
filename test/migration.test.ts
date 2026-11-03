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

async function queryCollection(controllerName: 'poetry' | 'dictionary' | 'food', action: string, query: Record<string, unknown>, records: unknown[] = []) {
  const captured: { collection?: string; where?: unknown; fields?: unknown; order?: string; page?: unknown[] } = {};
  const result = { count: records.length, totalPages: records.length ? 1 : 0, pageSize: 10, currentPage: 1, data: records };
  const model = {
    where(value: unknown) { captured.where = value; return this; },
    field(value: unknown) { captured.fields = value; return this; },
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

test('bangumi 接口已移除，不再注册模块或生成文档，原路径返回 404', async () => {
  const app = think.app as typeof think.app & LoadedApplication;
  assert.ok(!app.controllers.bangumi);
  assert.ok(!app.logics.bangumi);
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  assert.ok(!Object.keys(document.paths).some(url => url === '/bangumi' || url.startsWith('/bangumi/')));
  // 离线测试不启动服务，须等待框架启动准备完成，确保 404 模板已加载。
  await (think.beforeStartServer as () => Promise<unknown>)();
  for (const url of ['/bangumi', '/bangumi/index', '/bangumi?year=2020&month=10']) {
    assert.equal((await request(url)).status, 404, url);
  }
});

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

test('IP region routes query IPv4 by default and IPv6 explicitly using the new database fields', async () => {
  for (const suffix of ['', '&version=4']) {
    const result = JSON.parse((await request('/ip-to-region?ip=114.114.114.114' + suffix)).body);
    assert.deepEqual(result, {
      errno: 0, errmsg: '', data: {
        ip: '114.114.114.114', country: '中国', province: '江苏省', city: '南京市', isp: ''
      }
    });
  }
  const ip = '240e:3b7:3272:d8d0:db09:c067:8d59:539e';
  const result = JSON.parse((await request('/ip-to-region?version=6&ip=' + encodeURIComponent(ip))).body);
  assert.deepEqual(result, {
    errno: 0, errmsg: '', data: { ip, country: '中国', province: '广东省', city: '深圳市', isp: '电信' }
  });
});

test('IP region routes reject invalid versions, malformed addresses and version mismatches', async () => {
  for (const query of [
    'ip=invalid', 'ip=999.1.1.1', 'version=5&ip=114.114.114.114',
    'version=ipv6&ip=::1', 'version=6&ip=114.114.114.114', 'ip=::1'
  ]) {
    const result = JSON.parse((await request('/ip-to-region?' + query)).body);
    assert.notEqual(result.errno, 0, query);
  }
  const post = JSON.parse((await request('/ip-to-region', 'POST')).body);
  assert.equal(post.errmsg, 'METHOD_NOT_ALLOWED');
});

test('IP region falls back to client IP, normalizes mapped IPv4 and preserves native IPv6', async () => {
  const Controller = require('../src/controller/ip-to-region') as typeof import('../src/controller/ip-to-region');
  for (const [clientIp, query, expectedIp] of [
    ['::ffff:114.114.114.114', {}, '114.114.114.114'],
    ['240e:3b7:3272:d8d0:db09:c067:8d59:539e', { version: 6 }, '240e:3b7:3272:d8d0:db09:c067:8d59:539e']
  ] as const) {
    let data: unknown;
    await Controller.prototype.indexAction.call({
      ctx: { ip: clientIp }, getApiQuery: () => query,
      success(value: unknown) { data = value; },
      fail(message: string) { assert.fail(message); }
    } as unknown as InstanceType<typeof Controller>);
    assert.equal((data as { ip: string }).ip, expectedIp);
  }
});

test('month calendar returns a compact, ordered month including leap day, festivals and solar terms', async () => {
  const response = await request('/time/calendar?year=2024&month=2');
  assert.equal(response.status, 200);
  const result = JSON.parse(response.body);
  assert.equal(result.errno, 0);
  const days = result.data as import('../src/types/time').TimeCalendarDay[];
  assert.equal(days.length, 29);
  assert.deepEqual(days.map(row => row.date), Array.from({ length: 29 }, (_, i) => `2024-02-${String(i + 1).padStart(2, '0')}`));
  assert.equal(days[0].week, 4);
  assert.equal(days[0].cnWeek, '星期四');
  assert.equal(days[3].solarTerm, '立春');
  assert.equal(days[9].lunar, '正月');
  assert.ok(days[9].festivals.includes('春节'));
  assert.equal(days[10].lunar, '初二');
  assert.equal(days[10].solarTerm, '');
  assert.equal(days[0].dayInYear, 32);
  assert.equal(days[28].dayInYear, 60);
  for (const day of days) {
    assert.deepEqual(Object.keys(day).sort(), [
      'date', 'week', 'cnWeek', 'weekInYear', 'dayInYear', 'lunarMonth', 'lunarDay',
      'lunar', 'lunarMonthName', 'isWorkday', 'yi', 'ji', 'astro', 'yuexiang', 'wuhou', 'festivals', 'solarTerm'
    ].sort());
    const detail = JSON.parse((await request('/time?datetime=' + day.date)).body).data;
    assert.equal(day.cnWeek, detail.cnWeek, day.date);
    assert.equal(day.weekInYear, detail.weekInYear, day.date);
    assert.equal(day.dayInYear, detail.dayInYear, day.date);
    assert.equal(day.lunarMonth, detail.lunar.month, day.date);
    assert.equal(day.lunarDay, detail.lunar.day, day.date);
    assert.equal(day.lunarMonthName, detail.lunar.cnMonth, day.date);
    assert.equal(day.yi, detail.almanac.yi, day.date);
    assert.equal(day.ji, detail.almanac.ji, day.date);
    assert.equal(day.astro, detail.astro, day.date);
    assert.equal(day.yuexiang, detail.lunar.yuexiang, day.date);
    assert.equal(day.wuhou, detail.lunar.wuhou, day.date);
  }
  const march = JSON.parse((await request('/time/calendar?year=2023&month=3')).body).data;
  assert.equal(march.length, 31);
  assert.equal(march[21].lunar, '闰二月');
  assert.equal(march[21].lunarMonth, -2);
  assert.equal(march[21].lunarDay, 1);
  assert.equal(march[22].lunarMonthName, '闰二月');
  const february = JSON.parse((await request('/time/calendar?year=2023&month=2')).body).data;
  assert.equal(february.length, 28);
  const january = JSON.parse((await request('/time/calendar?year=2024&month=1')).body).data;
  assert.equal(january[0].weekInYear, 1);
  assert.equal(january[0].dayInYear, 1);
});

test('month calendar distinguishes holidays, make-up workdays, normal weekdays and missing annual schedules', async () => {
  const february = JSON.parse((await request('/time/calendar?year=2024&month=2')).body).data as import('../src/types/time').TimeCalendarDay[];
  assert.equal(february[0].isWorkday, true); // 普通周四
  assert.equal(february[2].isWorkday, false); // 普通周六
  assert.equal(february[3].isWorkday, true); // 周日调休上班
  assert.equal(february[11].isWorkday, false); // 春节假期周一
  assert.equal(february[17].isWorkday, true); // 周日调休上班
  for (const year of [1900, 2001, 2099]) {
    const days = JSON.parse((await request(`/time/calendar?year=${year}&month=12`)).body).data as import('../src/types/time').TimeCalendarDay[];
    assert.ok(days.every(day => day.isWorkday === null), String(year));
  }
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  assert.equal(document.components.schemas.TimeCalendarDay.properties.isWorkday.nullable, true);
});

test('month calendar validates year, month and method and defaults to the current month', async () => {
  for (const query of ['year=1899', 'year=2100', 'year=2024.5', 'year=abc', 'month=0', 'month=13', 'month=1.5', 'month=abc']) {
    const result = JSON.parse((await request('/time/calendar?' + query)).body);
    assert.notEqual(result.errno, 0, query);
  }
  const post = JSON.parse((await request('/time/calendar', 'POST')).body);
  assert.equal(post.errmsg, 'METHOD_NOT_ALLOWED');
  const before = new Date();
  const result = JSON.parse((await request('/time/calendar')).body);
  const after = new Date();
  const expected = [before, after].map(date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`);
  assert.equal(result.errno, 0);
  assert.ok(expected.includes(result.data[0].date));
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  const parameters = document.paths['/time/calendar'].get.parameters;
  assert.equal(parameters.find((p: { name: string }) => p.name === 'month').schema.maximum, 12);
});

test('bazi returns four pillars, hidden stems, ten gods and eight-character element counts', async () => {
  const response = await request('/time/bazi?year=1990&month=5&day=20&hour=10&minute=30&date=2024-02-10');
  assert.equal(response.status, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.errno, 0, response.body);
  const result = body.data as import('../src/types/bazi').BaziResult;
  assert.equal(result.birth, '1990-05-20 10:30:00');
  assert.equal(result.eightChars, '庚午 辛巳 乙酉 辛巳');
  assert.deepEqual(result.dayMaster, { stem: '乙', element: '木' });
  assert.equal(result.pillars.day.tenGod, '日主');
  assert.deepEqual(result.pillars.day.hiddenStems, [{ stem: '辛', element: '金', tenGod: '七杀' }]);
  assert.deepEqual(result.fiveElements.counts, { 金: 4, 木: 1, 水: 0, 火: 3, 土: 0 });
  assert.deepEqual(result.fiveElements.missing, ['水', '土']);
  assert.equal(result.zodiac, '马');
  assert.equal(result.baziZodiac, '马');
  assert.equal(result.astro, '金牛座');
  assert.equal(result.rules.sect, 2);
  assert.equal(result.almanac.date, '2024-02-10');
  const detail = JSON.parse((await request('/time?datetime=2024-02-10')).body).data;
  assert.equal(result.almanac.yi.join(' '), detail.almanac.yi);
  assert.equal(result.almanac.ji.join(' '), detail.almanac.ji);
  assert.ok(result.notice.includes('娱乐'));
});

test('bazi observes minute-level Li Chun boundaries and configurable late Zi day pillars', async () => {
  const base = '/time/bazi?year=2024&month=2&day=4&hour=16&minute=';
  const before = JSON.parse((await request(base + '26')).body).data;
  const after = JSON.parse((await request(base + '28')).body).data;
  assert.equal(before.pillars.year.ganZhi, '癸卯');
  assert.equal(before.pillars.month.ganZhi, '乙丑');
  assert.equal(after.pillars.year.ganZhi, '甲辰');
  assert.equal(after.pillars.month.ganZhi, '丙寅');
  assert.equal(after.zodiac, '兔');
  assert.equal(after.baziZodiac, '龙');
  const midnight = '/time/bazi?year=2024&month=2&day=5&hour=23';
  const sect1 = JSON.parse((await request(midnight + '&sect=1')).body).data;
  const sect2 = JSON.parse((await request(midnight + '&sect=2')).body).data;
  assert.equal(sect1.pillars.day.ganZhi, '庚子');
  assert.equal(sect2.pillars.day.ganZhi, '己亥');
  assert.equal(sect1.pillars.hour.ganZhi, '丙子');
  assert.equal(sect2.pillars.hour.ganZhi, '丙子');
  const begin = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  const zeroHour = JSON.parse((await request('/time/bazi?year=2024&month=2&day=29&hour=0')).body);
  const end = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  assert.equal(zeroHour.errno, 0);
  assert.equal(zeroHour.data.birth, '2024-02-29 00:00:00');
  assert.ok([begin, end].includes(zeroHour.data.almanac.date));
});

test('bazi rejects missing fields, invalid dates, out-of-range times and unsupported methods', async () => {
  const valid = 'year=2024&month=2&day=10&hour=0';
  for (const query of [
    '', 'year=2024&month=2&day=10', 'year=2024&month=2&hour=0',
    valid.replace('2024', '1899'), valid.replace('2024', '2100'),
    valid.replace('month=2', 'month=13'), valid.replace('day=10', 'day=30'),
    valid.replace('hour=0', 'hour=24'), valid.replace('hour=0', 'hour=-1'),
    valid.replace('hour=0', 'hour=1.5'), valid + '&minute=60', valid + '&minute=abc',
    valid + '&sect=3', valid + '&date=2024-02-30', valid + '&date=2099-13-01',
    valid + '&date=2024/02/10', valid + '&date=1899-01-01',
    'year=2023&month=2&day=29&hour=0'
  ]) {
    const response = await request('/time/bazi?' + query);
    assert.notEqual(JSON.parse(response.body).errno, 0, query);
    assert.notEqual(response.status, 500, query);
  }
  const post = JSON.parse((await request('/time/bazi?' + valid, 'POST')).body);
  assert.equal(post.errmsg, 'METHOD_NOT_ALLOWED');
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  const parameters = document.paths['/time/bazi'].get.parameters;
  assert.equal(parameters.find((p: { name: string }) => p.name === 'hour').required, true);
  assert.equal(parameters.find((p: { name: string }) => p.name === 'minute').schema.maximum, 59);
});

test('riddle queries combine category, question, guess, answer and literal keywords with stable pagination', async () => {
  const result = await queryCollection('dictionary', 'riddleAction', {
    category: 'character', question: '[春].*', guess: '打一字', answer: '篆', keyword: '(谜)', page: 2, pageSize: 5
  });
  assert.equal(result.collection, 'dictionary-riddle');
  assert.equal(result.order, '_id ASC');
  assert.deepEqual(result.page, [2, 5]);
  assert.deepEqual(result.where, {
    category: 'character', question: { $regex: '\\[春\\]\\.\\*' }, guess: { $regex: '打一字' }, answer: { $regex: '篆' },
    $or: [{ question: { $regex: '\\(谜\\)' } }, { guess: { $regex: '\\(谜\\)' } }, { answer: { $regex: '\\(谜\\)' } }]
  });
  const empty = await queryCollection('dictionary', 'riddleAction', {});
  assert.deepEqual(empty.where, {});
  assert.deepEqual(empty.page, [1, 10]);
  const reversed = await queryCollection('dictionary', 'riddleAction', { answer: '篆' });
  assert.deepEqual(reversed.where, { answer: { $regex: '篆' } });
});

test('riddle route rejects invalid filters, pagination and methods before querying MongoDB', async () => {
  for (const query of [
    'page=0', 'page=1.5', 'pageSize=0', 'pageSize=51', 'pageSize=abc',
    'category=unknown', 'category=zmmy', 'category=Character', 'category=brain_teaser', 'category=' + 'x'.repeat(31), ...['question', 'guess', 'answer', 'keyword'].map(field => field + '=' + 'x'.repeat(101))
  ]) {
    const result = JSON.parse((await request('/dictionary/riddle?' + query)).body);
    assert.notEqual(result.errno, 0, query);
  }
  assert.equal(JSON.parse((await request('/dictionary/riddle', 'POST')).body).errmsg, 'METHOD_NOT_ALLOWED');
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  assert.ok(document.paths['/dictionary/riddle'].get);
  assert.ok(!document.paths['/riddle']);
  const categories = Object.values(require('../src/types/dictionary').RiddleCategory).sort();
  const categoryParameter = document.paths['/dictionary/riddle'].get.parameters.find((p: { name: string }) => p.name === 'category');
  assert.deepEqual(categoryParameter.schema.enum.slice().sort(), categories);
  assert.deepEqual(document.components.schemas.Riddle.properties.category.enum.slice().sort(), categories);
});

test('riddle import is a JSON array with exactly seven fields, no IDs or redundant metadata', () => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'deploy/dictionary-riddle.json'), 'utf8')) as Omit<import('../src/types/dictionary').Riddle, '_id'>[];
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 50000);
  const fields = ['question', 'guess', 'answer', 'category', 'categoryName', 'hint', 'explanation'].sort();
  const unique = new Set<string>();
  const categories = new Map<string, string>();
  for (const row of data) {
    assert.deepEqual(Object.keys(row).sort(), fields);
    assert.ok(Object.values(row).every(value => typeof value === 'string'));
    assert.ok(row.question.trim() && row.answer.trim());
    if (categories.has(row.category)) assert.equal(categories.get(row.category), row.categoryName);
    categories.set(row.category, row.categoryName);
    unique.add(JSON.stringify(row));
  }
  assert.equal(unique.size, data.length);
  assert.equal(categories.size, 25);
  assert.deepEqual([...categories.keys()].sort(), Object.values(require('../src/types/dictionary').RiddleCategory).sort());
  const sample = data.find(row => row.question === '个个断前缘');
  assert.ok(sample);
  assert.equal(sample.guess, '打一字');
  assert.equal(sample.answer, '篆');
});

test('food nutrition queries combine category filters, exact aliases, literal keywords and stable pagination', async () => {
  const result = await queryCollection('food', 'nutritionAction', {
    name: '地瓜', keyword: '[红薯].*', category: 'tuber', categoryCode: 33, page: 2, pageSize: 5
  });
  assert.equal(result.collection, 'food-nutrition');
  assert.equal(result.order, '_id ASC');
  assert.deepEqual(result.page, [2, 5]);
  assert.deepEqual(result.where, {
    category: 'tuber', categoryCode: 33,
    $and: [
      { $or: [{ name: '地瓜' }, { aliases: '地瓜' }] },
      { $or: [{ name: { $regex: '\\[红薯\\]\\.\\*' } }, { aliases: { $regex: '\\[红薯\\]\\.\\*' } }] }
    ]
  });
  const empty = await queryCollection('food', 'nutritionAction', {});
  assert.deepEqual(empty.where, {});
  assert.deepEqual(empty.page, [1, 10]);
});

test('food nutrition route rejects invalid pagination, enums and excessive search lengths before querying MongoDB', async () => {
  for (const query of ['page=0', 'pageSize=51', 'pageSize=1.5', 'category=unknown', 'categoryCode=-1', 'categoryCode=1.5', 'name=' + 'x'.repeat(101), 'keyword=' + 'x'.repeat(101)]) {
    const response = await request('/food/nutrition?' + query);
    assert.notEqual(JSON.parse(response.body).errno, 0, query);
    assert.notEqual(response.status, 500, query);
  }
  assert.equal(JSON.parse((await request('/food/nutrition', 'POST')).body).errmsg, 'METHOD_NOT_ALLOWED');
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  const operation = document.paths['/food/nutrition'].get;
  assert.ok(operation);
  assert.equal(document.components.schemas.FoodNutrition.properties.proteinG.nullable, true);
  assert.ok(!operation.parameters.some((parameter: { name: string }) => ['source', 'sourceVersion'].includes(parameter.name)));
  assert.ok(!document.components.schemas.FoodSource);
});

test('recipe queries combine literal ingredient search, enums, numeric limits and stable pagination', async () => {
  const result = await queryCollection('food', 'recipeAction', {
    name: '[鸡蛋].*', keyword: '(红烧)', ingredient: '鸡蛋', category: 'meatDish', tag: '春季', taste: '咸鲜', method: '炖', difficulty: 2, maxDuration: 60, page: 2, pageSize: 5
  });
  assert.equal(result.collection, 'food-recipe');
  assert.deepEqual(result.fields, { images: 0, 'steps.images': 0 });
  assert.equal(result.order, '_id ASC');
  assert.deepEqual(result.page, [2, 5]);
  assert.deepEqual(result.where, {
    name: { $regex: '\\[鸡蛋\\]\\.\\*' }, 'ingredients.name': { $regex: '鸡蛋' },
    category: 'meatDish', tags: '春季', taste: '咸鲜', method: '炖', difficulty: 2,
    duration: { $gt: 0, $lte: 60 },
    $or: [{ name: { $regex: '\\(红烧\\)' } }, { 'ingredients.name': { $regex: '\\(红烧\\)' } }]
  });
  const empty = await queryCollection('food', 'recipeAction', {});
  assert.deepEqual(empty.where, {});
  assert.deepEqual(empty.page, [1, 10]);
  const variants = [{ name: '西红柿炒鸡蛋', steps: [{ text: '先炒蛋' }] }, { name: '西红柿炒鸡蛋', steps: [{ text: '先炒番茄' }] }];
  await queryCollection('food', 'recipeAction', { name: '西红柿炒鸡蛋' }, variants);
});

test('recipe route validates filters and documents duration in minutes and 1-5 star difficulty', async () => {
  for (const query of [
    'category=unknown', 'difficulty=0', 'difficulty=6', 'difficulty=1.5', 'maxDuration=0', 'maxDuration=-1', 'maxDuration=1.5',
    'page=0', 'pageSize=51', 'pageSize=abc',
    ...['name', 'keyword', 'ingredient'].map(field => field + '=' + 'x'.repeat(101)),
    ...['tag', 'taste', 'method'].map(field => field + '=' + 'x'.repeat(31))
  ]) {
    const response = await request('/food/recipe?' + query);
    assert.notEqual(JSON.parse(response.body).errno, 0, query);
    assert.notEqual(response.status, 500, query);
  }
  assert.equal(JSON.parse((await request('/food/recipe', 'POST')).body).errmsg, 'METHOD_NOT_ALLOWED');
  const document = JSON.parse(fs.readFileSync(path.join(root, 'www/swagger/openapi.json'), 'utf8'));
  const operation = document.paths['/food/recipe'].get;
  assert.ok(operation);
  assert.deepEqual(operation.parameters.find((p: { name: string }) => p.name === 'category').schema.enum.slice().sort(), Object.values(require('../src/types/food').RecipeCategory).sort());
  assert.equal(operation.parameters.find((p: { name: string }) => p.name === 'difficulty').schema.maximum, 5);
  assert.equal(document.components.schemas.Recipe.properties.duration.type, 'number');
  assert.equal(document.components.schemas.Recipe.properties.duration.nullable, true);
  assert.equal(document.components.schemas.Recipe.properties.difficulty.nullable, true);
  assert.ok(!document.components.schemas.Recipe.properties.durationMinutes);
  assert.ok(!document.components.schemas.Recipe.properties.difficultyStars);
  assert.ok(!document.components.schemas.Recipe.properties.images);
  assert.ok(!document.components.schemas.RecipeStep.properties.images);
});
