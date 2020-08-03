const Base = require('./base');
const axios = require('axios');
const Base64 = require('js-base64').Base64;

module.exports = class extends Base {
  async disstsAction() {
    const qquin = this.get('qquin');
    const APIURL = 'https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss';
    await axios.get(
      APIURL,
      {
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
      }
    ).then(response => {
      return this.success(response.data);
    });
  }

  async listsAction() {
    const { disstid } = this.get();
    const APIURL = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
    await axios.get(
      APIURL,
      {
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
      }
    ).then(response => {
      const fetch = response.data;
      if (fetch.code !== 0) return this.fail();
      const cdlist = fetch.cdlist ? fetch.cdlist[0] : [];
      const { disstid, dissname, logo, desc, tags, songnum, songlist } = cdlist;
      const lists = [];
      for (const item of songlist) {
        const { albumdesc, albummid, albumname, interval, pay, singer, songmid, songname, songorig } = item;
        lists.push({ albumdesc, albummid, albumname, interval, pay, singer, songmid, songname, songorig });
      }
      const result = {
        disstid, dissname, logo, desc, tags, songnum, songlist: lists
      };
      return this.success(result);
    });
  }

  async songsAction() {
    const { songmid } = this.get();
    const APIURL = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
    const postData = {
      req: {
        module: 'CDN.SrfCdnDispatchServer',
        method: 'GetCdnDispatch',
        param: {
          guid: '95350356',
          calltype: 0,
          userip: ''
        }
      },
      req_0: {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
          guid: '95350356',
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
    await axios.get(
      APIURL,
      {
        headers: {
          'origin': 'https://y.qq.com',
          'referer': 'https://y.qq.com/portal/player.html',
          'Sec-Fetch-Mode': 'cors'
        },
        params: {
          '-': 'getplaysongvkey0024833456325026315',
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
      }
    ).then(response => {
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
    });
  }

  async lyricAction() {
    const { songmid } = this.get();
    const APIURL = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg';
    await axios.get(
      APIURL,
      {
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
      }
    ).then(response => {
      let res = response.data;
      const start = res.indexOf('{');
      const end = res.lastIndexOf(')');
      res = JSON.parse(res.substring(start, end));
      res.lyric = Base64.decode(res.lyric);
      res.translate = Base64.decode(res.trans);
      return this.success(res);
    });
  }
};
