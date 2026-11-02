import fs = require('node:fs');
import path = require('node:path');
import { IPv4, IPv6, loadHeader, loadVectorIndexFromFile, newWithVectorIndex, verify, versionFromHeader } from 'ip2region.js';
import type { IpVersion } from '../types/ip-to-region';

// 两种地址各缓存 512 KiB 的只读索引，不缓存整个数据库。
const vectorIndexes = new Map<string, Buffer>();

export async function search(ip: string, version: IpVersion = 4): Promise<string> {
  const dbPath = path.join(think.ASSETS_PATH, 'ip2region', `ip2region_v${version}.xdb`);
  const ipVersion = version === 6 ? IPv6 : IPv4;
  let vectorIndex = vectorIndexes.get(dbPath);
  if (!vectorIndex) {
    const fd = fs.openSync(dbPath, 'r');
    try {
      verify(fd);
      if (versionFromHeader(loadHeader(fd))?.id !== ipVersion.id) {
        throw new Error(`IP version does not match database: ${dbPath}`);
      }
    } finally {
      fs.closeSync(fd);
    }
    vectorIndex = loadVectorIndexFromFile(dbPath);
    vectorIndexes.set(dbPath, vectorIndex);
  }

  const searcher = newWithVectorIndex(ipVersion, dbPath, vectorIndex);
  try {
    return await searcher.search(ip);
  } finally {
    searcher.close();
  }
}
