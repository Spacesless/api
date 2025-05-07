module.exports = class extends think.Logic {
  indexAction() {
    const rules = {
      id: {
        required: true,
        regexp: /\d{6}/g
      }
    };

    const msgs = {
      id: {
        required: '{name} 不能为空',
        regexp: '请输入身份证前6位'
      }
    };

    const flag = this.validate(rules, msgs);
    if (!flag) {
      return this.fail(this.config('validateDefaultErrno'), 'validate error', this.validateErrors);
    }
  }
};
