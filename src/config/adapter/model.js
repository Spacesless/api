const path = require('path');

const isDev = think.env === 'development';
let config = {};
try {
  config = require(path.join(think.ROOT_PATH, 'config/adapter.model.js'));
} catch (e) {
  console.error(e);
}

const { host, port, user, password, database } = config;

module.exports = {
  type: 'mongo',
  common: {
    logConnect: isDev,
    logSql: isDev,
    logger: msg => think.logger.info(msg)
  },
  mongo: {
    host: host || '127.0.0.1',
    port: port || 27017,
    user: user,
    password: password,
    database: database || 'api', // 数据库名称
    options: {
      // 身份验证相关
      // replicaSet: 'mgset-3074013',
      // authSource: 'admin'
    }
  }
};
