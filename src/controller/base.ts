import type { ApiQuery } from '../types/data';
import type { paths } from '../types/openapi';
const isDev = think.env === 'development';

export = class extends think.Controller {
  /** Read query parameters using the public OpenAPI contract. Logic remains responsible for validation. */
  protected getApiQuery<P extends keyof paths>(_path: P): ApiQuery<P> {
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
