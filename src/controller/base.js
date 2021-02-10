module.exports = class extends think.Controller {
  // 添加CROS跨域资源共享头部
  __before() {
    this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    this.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    // this.header('Access-Control-Allow-Credentials', true); // 是否可以发送cookie

    // cdn加速域名
    this.CDNDomain = '//cos.timelessq.com';
  }
};
