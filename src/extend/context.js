module.exports = {
  /**
   * 判断客户端是否支持webp格式
   */
  get isSuportWebp() {
    const headers = this.header;
    const Agents = headers['user-agent'];
    const edge = parseInt(Agents.substr(Agents.indexOf('Edge/') + 5));
    const google = parseInt(Agents.substr(Agents.indexOf('Chrome/') + 7));
    const firefox = parseInt(Agents.substr(Agents.indexOf('Firefox/') + 8));
    const opera = parseFloat(Agents.substr(Agents.indexOf('Opera/') + 6));
    return (google >= 23 && !edge) || firefox > 65 || edge > 17 || opera >= 12.1;
  }
};
