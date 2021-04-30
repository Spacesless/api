const Base = require('../base');
const axios = require('axios');
const Encrypt = require('../../utils/crypto.js');
const qs = require('querystring');

module.exports = class extends Base {
  async cdListAction() {
    const uid = this.get('uid');

    const data = {
      offset: 0,
      limit: 20,
      csrf_token: '',
      uid
    };
    const { params, encSecKey } = Encrypt(data);

    const APIURL = 'https://music.163.com/weapi/user/playlist';
    await axios({
      url: APIURL,
      method: 'post',
      headers: {
        'Referer': 'http://music.163.com',
        'Host': 'music.163.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({ params, encSecKey })
    }).then(res => {
      const { code, playlist } = res.data;
      if (code !== 200) return this.fail(res.data);
      const creator = playlist[0] ? playlist[0].creator : {};
      const result = {
        uid: creator.userId,
        nickname: creator.nickname,
        total: playlist.length || 0,
        lists: playlist.map(item => {
          return {
            tid: item.id,
            name: item.name,
            cover: item.coverImgUrl,
            songCount: item.trackCount,
            playCount: item.playCount
          };
        })
      };
      return this.success(result);
    }).catch(error => {
      return this.fail(error);
    });
  }

  async songListAction() {
    const { disstid } = this.get();
    const APIURL = 'https://music.163.com/api/playlist/detail';
    await axios.get(APIURL, {
      headers: {
        'Referer': 'http://music.163.com',
        'Host': 'music.163.com'
      },
      params: {
        id: disstid
      }
    }).then(res => {
      const { code, result } = res.data;
      if (code !== 200) return this.fail(res.data);
      const { id, name, creator, coverImgUrl, description, tags, playCount, trackCount, tracks } = result;
      const lists = tracks.map(item => {
        const { id, name, duration, artists, album, fee } = item;
        return {
          songmid: id,
          songname: name,
          interval: Math.ceil(duration / 1000),
          singer: artists.map(child => {
            return {
              id: child.id,
              name: child.name
            };
          }),
          albumcover: album.picUrl,
          albumname: album.name,
          albumdesc: album.description,
          free: fee !== 1
        };
      });
      const data = {
        disstid: id,
        dissname: name,
        nickname: creator ? creator.nickname : '',
        cover: coverImgUrl,
        desc: description,
        tags,
        playCount: playCount,
        songnum: trackCount,
        songlist: lists
      };
      return this.success(data);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 搜索歌曲名
  async searchAction() {
    const { keyword, type, page, pageSize } = this.get();

    const data = {
      s: keyword,
      type: type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
      offset: page || 0,
      limit: pageSize || 30
    };
    const { params, encSecKey } = Encrypt(data);

    const APIURL = 'https://music.163.com/weapi/cloudsearch/get/web';
    await axios({
      url: APIURL,
      method: 'post',
      headers: {
        'Referer': 'http://music.163.com',
        'Host': 'music.163.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({ params, encSecKey })
    }).then(res => {
      const { code, result } = res.data;
      if (code !== 200) return this.fail(res.data);
      const songlists = result.songs.map(item => {
        const { id, name, dt, ar, al, fee } = item;
        return {
          songmid: id,
          songname: name,
          interval: Math.ceil(dt / 1000),
          singer: ar.map(child => {
            return {
              id: child.id,
              name: child.name
            };
          }),
          albumcover: al.picUrl,
          albumname: al.name,
          free: fee !== 1
        };
      });
      const data = {
        total: result.songCount,
        list: songlists
      };
      return this.success(data);
    }).catch(error => {
      return this.fail(error);
    });
  }

  async songUrlAction() {
    const { songmid } = this.get();

    const data = {
      br: 320000,
      ids: songmid.split(',')
    };
    const { params, encSecKey } = Encrypt(data);

    const APIURL = 'https://music.163.com/weapi/song/enhance/player/url';
    await axios({
      url: APIURL,
      method: 'post',
      headers: {
        'Referer': 'http://music.163.com',
        'Host': 'music.163.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({ params, encSecKey })
    }).then(res => {
      const { code, data } = res.data;
      if (code !== 200) return this.fail(res.data);
      const lists = data.map(item => {
        return {
          songmid: item.id,
          url: item.url
        };
      });
      return this.success(lists);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 根据歌曲id获取歌词
  async lyricAction() {
    const { songmid } = this.get();
    const APIURL = 'https://music.163.com/api/song/lyric';
    await axios.get(APIURL, {
      headers: {
        'Referer': 'http://music.163.com',
        'Host': 'music.163.com'
      },
      params: {
        id: songmid,
        os: 'osx',
        lv: -1,
        kv: -1,
        tv: -1
      }
    }).then(res => {
      const { code, lrc, tlyric } = res.data;
      if (code !== 200) return this.fail();
      return this.success({ lyric: lrc.lyric, tlyric: tlyric.lyric });
    }).catch(error => {
      return this.fail(error);
    });
  }
};
