const Base = require('./base');
const axios = require('axios');

module.exports = class extends Base {
  __before() {
    super.__before();
    const referer = this.referer();
    if (!(referer && (referer.includes('timelessq.com') || referer.includes('127.0.0.1')))) {
      return this.fail('Permission denied');
    }
  }

  // 根据QQ号获取歌单
  async cdListAction() {
    const qquin = this.get('qquin');
    const APIURL = 'https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss';
    await axios.get(APIURL, {
      headers: {
        host: 'c.y.qq.com',
        referer: 'https://y.qq.com/'
      },
      params: {
        hostuin: qquin,
        sin: 0,
        size: 40,
        r: 1571120577356,
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
    }).then(response => {
      return this.success(response.data.data);
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
    }).then(response => {
      const fetch = response.data;
      if (fetch.code !== 0) return this.fail();
      const cdlist = fetch.cdlist ? fetch.cdlist[0] : [];
      const { nickname, disstid, dissname, logo, desc, tags, songnum, songlist, visitnum } = cdlist;
      const lists = [];
      for (const item of songlist) {
        const { albumdesc, albumid, albummid, albumname, interval, pay, singer, songmid, songname, songorig } = item;
        lists.push({ albumdesc, albumid, albummid, albumname, interval, pay, singer, songmid, songname, songorig });
      }
      const result = {
        nickname, disstid, dissname, logo, desc, tags, songnum, songlist: lists, visitnum
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
    }).then(response => {
      return this.success(response.data.data);
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
    }).then(response => {
      const fetch = response.data;
      if (fetch.code !== 0) return this.fail();
      const req = fetch.req_0.data;
      const { sip, midurlinfo } = req;
      const lists = [];
      for (const item of midurlinfo) {
        const { filename, purl, songmid, vkey } = item;
        lists.push({ filename, purl, songmid, vkey });
      }
      const result = {
        sip,
        lists
      };
      return this.success(result);
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
    }).then(response => {
      let res = response.data;
      const start = res.indexOf('{');
      const end = res.lastIndexOf(')');
      res = JSON.parse(res.substring(start, end));
      const lyric = Buffer.from(res.lyric, 'base64').toString();
      const trans = Buffer.from(res.trans, 'base64').toString();
      return this.success({ lyric, trans });
    }).catch(error => {
      return this.fail(error);
    });
  }
};
