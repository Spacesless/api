const mysql = require('think-model-mysql');

const isDev = think.env === 'development';

module.exports = {
  type: 'mysql',
  common: {
    logConnect: isDev,
    logSql: isDev,
    logger: msg => think.logger.info(msg)
  },
  mysql: { // mysql 配置
    handle: mysql,
    user: 'root', // 用户名
    password: 'root', // 密码
    database: 'tl_api', // 数据库
    host: '127.0.0.1', // host
    port: 3306, // 端口
    prefix: 'tl_'
  },
  mysql2: { // 另一个 mysql 的配置
    handle: mysql,
    user: 'root', // 用户名
    password: '', // 密码
    database: '', // 数据库
    host: '127.0.0.1', // host
    port: 3306, // 端口
    prefix: ''
  }
};
