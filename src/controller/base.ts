const isDev = think.env === 'development';

export = class extends think.Controller {
  /** Query types and Logic rules are the source for generated API documentation. */
  protected getApiQuery<T extends object>(): T {
    return this.get();
  }

  // 添加CROS跨域资源共享头部
  __before() {
    if (isDev) {
      this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
      this.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
      // this.header('Access-Control-Allow-Credentials', true); // 是否可以发送cookie
      this.header('Access-Control-Allow-Headers', '*');
    }
  }
};
