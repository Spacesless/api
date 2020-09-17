module.exports = class extends think.Controller {
  // 添加CROS跨域资源共享头部
  __before() {
    this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    this.header('Access-Control-Allow-Headers', 'x-requested-with');
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    this.header('Access-Control-Allow-Credentials', true);
  }
};
