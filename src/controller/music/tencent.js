const Base = require('../base');
const axios = require('axios');

module.exports = class extends Base {
  // 根据QQ号获取歌单
  async cdListAction() {
    const uid = this.get('uid');

    const APIURL = 'https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss';
    await axios.get(APIURL, {
      headers: {
        host: 'c.y.qq.com',
        referer: 'https://y.qq.com/'
      },
      params: {
        hostuin: uid,
        sin: 0,
        size: 40,
        r: 1614957597503,
        g_tk_new_20200303: 1718906646,
        g_tk: 1718906646,
        loginUin: 804093032,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0
      }
    }).then(res => {
      const { hostuin, hostname, totoal, disslist } = res.data.data;
      const lists = [];
      disslist.forEach(item => {
        if (item.tid) {
          lists.push({
            tid: item.tid,
            name: item.diss_name,
            cover: item.diss_cover,
            songCount: item.song_cnt,
            playCount: item.listen_num
          });
        }
      });
      const result = {
        uid: hostuin,
        nickname: hostname,
        total: totoal,
        lists
      };
      return this.success(result);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 根据歌单id获取歌曲列表
  async songListAction() {
    const { disstid } = this.get();
    const APIURL = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
    await axios.get(APIURL, {
      headers: {
        host: 'c.y.qq.com',
        referer: 'https://y.qq.com/'
      },
      params: {
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        disstid,
        g_tk: 1745555300,
        loginUin: 804093032,
        hostUin: 0,
        format: 'json',
        inCharset: 'urf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0
      }
    }).then(res => {
      const { code, cdlist } = res.data;
      if (code !== 0) return this.fail();
      const firstCd = cdlist ? cdlist[0] : [];
      const { nickname, disstid, dissname, logo, desc, tags, songnum, songlist, visitnum } = firstCd;
      const lists = [];
      for (const item of songlist) {
        const { albumdesc, albummid, albumname, interval, msgid, pay, singer, songmid, songname } = item;
        lists.push({
          songmid,
          songname,
          interval,
          singer,
          albumcover: this.getAlbumCover(albummid),
          albumname: albumname,
          albumdesc: albumdesc,
          free: msgid === 0 && pay.payplay === 0
        });
      }
      const result = {
        disstid,
        dissname,
        nickname,
        cover: logo,
        desc,
        tags: tags.map(item => item.name),
        playCount: visitnum,
        songnum,
        songlist: lists
      };
      return this.success(result);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 搜索歌曲名
  async searchAction() {
    const { keyword, page, pageSize } = this.get();
    const APIURL = 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp';
    await axios.get(APIURL, {
      params: {
        ct: 24,
        qqmusic_ver: 1298,
        new_json: 1,
        remoteplace: 'txt.yqq.song',
        searchid: 54551315998285841,
        t: 0,
        aggr: 1,
        cr: 1,
        catZhida: 1,
        lossless: 0,
        flag_qc: 0,
        p: page,
        n: pageSize,
        w: keyword,
        g_tk: 5381,
        loginUin: 804093032,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0
      }
    }).then(res => {
      const song = res.data.data.song;
      const { totalnum, list } = song;
      const songlists = list.map(item => {
        const { album, interval, name, mid, singer, pay } = item;
        return {
          songmid: mid,
          songname: name,
          interval,
          singer: singer.map(child => {
            return {
              id: child.id,
              name: child.name
            };
          }),
          albumcover: this.getAlbumCover(album.mid),
          albumname: album.name,
          albumdesc: album.subtitle,
          free: pay.pay_play === 0
        };
      });
      const result = {
        total: totalnum,
        list: songlists
      };
      return this.success(result);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 根据歌曲id获取音乐文件地址
  async songUrlAction() {
    const { songmid } = this.get();
    const APIURL = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
    const postData = {
      req: {
        module: 'CDN.SrfCdnDispatchServer',
        method: 'GetCdnDispatch',
        param: {
          guid: '5768351945',
          calltype: 0,
          userip: ''
        }
      },
      req_0: {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
          guid: '5768351945',
          songmid: songmid.split(','),
          songtype: [0],
          uin: '804093032',
          loginflag: 1,
          platform: '20'
        }
      },
      comm: {
        uin: 804093032,
        format: 'json',
        ct: 24,
        cv: 0
      }
    };
    await axios.get(APIURL, {
      params: {
        '-': 'getplaysongvkey36597529893735015',
        g_tk: 5381,
        loginUin: 804093032,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0,
        data: JSON.stringify(postData)
      }
    }).then(res => {
      const { code, req_0: req0 } = res.data;
      if (code !== 0) return this.fail();
      const req = req0.data;
      const { sip, midurlinfo } = req;
      const lists = [];
      for (const item of midurlinfo) {
        const { purl, songmid } = item;
        lists.push({ songmid, url: sip[0] + purl });
      }
      return this.success(lists);
    }).catch(error => {
      return this.fail(error);
    });
  }

  // 根据歌曲id获取歌词
  async lyricAction() {
    const { songmid } = this.get();
    const APIURL = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg';
    await axios.get(APIURL, {
      headers: {
        host: 'c.y.qq.com',
        referer: 'https://y.qq.com/'
      },
      params: {
        callback: 'MusicJsonCallback_lrc',
        pcachetime: 1541571462413,
        songmid,
        g_tk: 5381,
        jsonpCallback: 'MusicJsonCallback_lrc',
        loginUin: 0,
        hostUin: 0,
        format: 'jsonp',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0
      }
    }).then(res => {
      let data = res.data;
      const start = data.indexOf('{');
      const end = data.lastIndexOf(')');
      data = JSON.parse(res.substring(start, end));
      const lyric = Buffer.from(data.lyric, 'base64').toString();
      const tlyric = Buffer.from(data.trans, 'base64').toString();
      return this.success({ lyric, tlyric });
    }).catch(error => {
      return this.fail(error);
    });
  }

  getAlbumCover(id) {
    return id ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${id}.jpg?max_age=2592000` : '';
  }
};
