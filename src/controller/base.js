module.exports = class extends think.Controller {
  __before() {
    this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    this.header('Access-Control-Allow-Headers', 'x-requested-with');
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    this.header('Access-Control-Allow-Credentials', true);
  }
};
