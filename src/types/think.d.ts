import type { NumericQuery, PageResult } from './common';
import 'thinkjs';

import type EnglishSentenceModel = require('../model/english-sentence');
import type BingModel = require('../model/bing');
import type JokeModel = require('../model/joke');
import type SentenceModel = require('../model/sentence');

/** Types for the think-mongo extension used by this application. */
declare class MongoModel<T = Record<string, unknown>> {
  constructor(name: string, config?: object);
  where(filter: object): this;
  field(fields: string): this;
  order(order: string): this;
  page(page?: NumericQuery, pageSize?: NumericQuery): this;
  limit(offset: number, count: number): this;
  count(field?: string): Promise<number>;
  find(): Promise<Partial<T>>;
  select(): Promise<T[]>;
  countSelect(): Promise<PageResult<T>>;
  thenAdd(record: object): Promise<{ _id: unknown; type: 'add' | 'exist' }>;
}

interface Models {
  'english-sentence': InstanceType<typeof EnglishSentenceModel>;
  bing: InstanceType<typeof BingModel>;
  joke: InstanceType<typeof JokeModel>;
  sentence: InstanceType<typeof SentenceModel>;
}

declare module 'thinkjs' {
  interface Think {
    ASSETS_PATH: string;
    Mongo: typeof MongoModel;
    mongo<K extends keyof Models>(name: K): Models[K];
    mongo<T = Record<string, unknown>>(name: string): MongoModel<T>;
  }
  interface Controller {
    fail(): unknown;
    mongo<K extends keyof Models>(name: K): Models[K];
    mongo<T = Record<string, unknown>>(name: string): MongoModel<T>;
  }
}
