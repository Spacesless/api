const path = require('path');
const mysql = require('think-model-mysql');

const isDev = think.env === 'development';
let config = {
  mongo: {},
  mysql: {}
};
try {
  config = require(path.join(think.ROOT_PATH, 'config/adapter.model.js'));
} catch (e) {
  console.error(e);
}

const { host, port, user, password, database } = config.mongo;
const { host: mysqlHost, port: mysqlPort, user: mysqlUser, password: mysqlPs, database: mysqlDb, prefix } = config.mysql;

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
  },
  mysql: { // 另一个 mysql 的配置
    handle: mysql,
    user: mysqlUser, // 用户名
    password: mysqlPs, // 密码
    database: mysqlDb || 'chevereto', // 数据库
    host: mysqlHost || '127.0.0.1', // host
    port: mysqlPort, // 端口
    prefix: prefix
  }
};
