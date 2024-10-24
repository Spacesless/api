const Base = require('./base');
const axios = require('axios');

module.exports = class extends Base {
  // 个人信息
  async infoAction() {
    const mid = this.get('mid');
    await axios.get('https://api.bilibili.com/x/space/acc/info', {
      params: {
        mid,
        jsonp: 'jsonp'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
      }
    }).then(response => {
      const info = response.data.data || {};
      return this.success(info);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 收藏分类列表
  async favoriteAction() {
    const mid = this.get('mid');
    await axios.get('https://api.bilibili.com/x/v3/fav/folder/created/list-all', {
      headers: {
        origin: 'https://space.bilibili.com'
      },
      params: {
        up_mid: mid
      }
    }).then(response => {
      return this.success(response.data.data);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 收藏视频列表
  async resourceAction() {
    const id = this.get('id');
    const page = this.get('page') || 1;
    const pageSize = this.get('pageSize') || 20;
    await axios.get('https://api.bilibili.com/x/v3/fav/resource/list', {
      headers: {
        origin: 'https://space.bilibili.com'
      },
      params: {
        media_id: id,
        pn: page,
        ps: pageSize,
        order: 'mtime',
        type: 0,
        tid: 0,
        platform: 'web'
      }
    }).then(response => {
      const lists = response.data.data || {};
      return this.success(lists);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 关注列表
  async followingAction() {
    const mid = this.get('mid');
    const page = this.get('page') || 1;
    const pageSize = this.get('pageSize') || 20;
    await axios.get('https://api.bilibili.com/x/relation/followings', {
      headers: {
        origin: 'https://space.bilibili.com',
        referer: 'https://space.bilibili.com/315883644/fans/follow'
      },
      params: {
        vmid: mid,
        pn: page,
        ps: pageSize,
        order: 'desc'
      }
    }).then(response => {
      const lists = response.data.data || {};
      return this.success(lists);
    }).catch(error => {
      return this.fail(error);
    });
  }
};
