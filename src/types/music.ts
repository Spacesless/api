/** QQ 音乐歌手信息。 */
export interface TencentSinger {
    /** 歌手数字 ID。 */
    id: number;
    /** 歌手名称。 */
    name: string;
}
/** QQ 音乐歌单中的歌曲信息。 */
export interface TencentSong {
    /** 专辑说明。 */
    albumdesc: string;
    /** 专辑 MID，用于拼接封面地址。 */
    albummid: string;
    /** 专辑名称。 */
    albumname: string;
    /** 歌曲时长，单位为秒。 */
    interval: number;
    /** 上游播放状态码，现有逻辑结合付费标记判断是否免费。 */
    msgid: number;
    /** 上游付费标记，字段名随接口有所不同。 */
    pay: {
        /** 歌单接口的播放付费标记，现有逻辑将 0 视为免费。 */
        payplay: number;
        /** 其他上游返回结构中的播放付费标记。 */
        pay_play: number;
    };
    /** 歌曲的歌手列表。 */
    singer: TencentSinger[];
    /** 歌曲 MID。 */
    songmid: string;
    /** 歌曲名称。 */
    songname: string;
}
/** QQ 音乐歌单详情。 */
export interface TencentCd {
    /** 歌单创建者昵称。 */
    nickname: string;
    /** 歌单 ID。 */
    disstid: string;
    /** 歌单名称。 */
    dissname: string;
    /** 歌单封面地址。 */
    logo: string;
    /** 歌单描述。 */
    desc: string;
    /** 歌单标签列表。 */
    tags: {
        /** 标签 ID。 */
        id: number;
        /** 标签名称。 */
        name: string;
    }[];
    /** 歌单歌曲总数。 */
    songnum: number;
    /** 歌单中的歌曲列表。 */
    songlist: TencentSong[];
    /** 歌单访问或播放统计值。 */
    visitnum: number;
}
/** QQ 音乐搜索结果中的歌曲信息。 */
export interface TencentSearchSong {
    /** 歌曲所属专辑信息。 */
    album: {
        /** 专辑 MID，用于生成封面地址。 */
        mid: string;
        /** 专辑名称。 */
        name: string;
        /** 专辑副标题。 */
        subtitle: string;
    };
    /** 歌曲时长，单位为秒。 */
    interval: number;
    /** 歌曲名称。 */
    name: string;
    /** 歌曲 MID。 */
    mid: string;
    /** 歌手列表。 */
    singer: TencentSinger[];
    /** 歌曲付费信息。 */
    pay: {
        /** 播放付费标记，现有逻辑将 0 视为免费。 */
        pay_play: number;
    };
}
/** QQ 音乐搜索接口响应。 */
export interface TencentSearchResponse {
    /** 批量请求中搜索子请求的返回结果。 */
    req_0?: {
        /** 搜索子请求的数据。 */
        data: {
            /** 搜索结果主体。 */
            body?: {
                /** 歌曲搜索结果分组。 */
                song: {
                    /** 匹配到的歌曲列表。 */
                    list: TencentSearchSong[];
                };
            };
            /** 搜索结果统计信息。 */
            meta?: {
                /** 匹配到的歌曲总数。 */
                sum: number;
            };
        };
    };
}
/** QQ 音乐用户歌单列表接口响应。 */
export interface TencentCdListResponse {
    /** 用户歌单数据。 */
    data: {
        /** 用户 QQ 号码。 */
        hostuin: number;
        /** 用户昵称。 */
        hostname: string;
        /** 上游返回的歌单总数；保留上游字段的拼写。 */
        totoal: number;
        /** 用户歌单列表。 */
        disslist: {
            /** 歌单 ID。 */
            tid: number;
            /** 歌单名称。 */
            diss_name: string;
            /** 歌单封面地址。 */
            diss_cover: string;
            /** 歌单歌曲数量。 */
            song_cnt: number;
            /** 歌单收听统计值。 */
            listen_num: number;
        }[];
    };
}
export interface MusicTencentCdListQuery {
    /**
     * @description QQ号码
     * @example 804093032
     */
    uid: number;
}
export interface MusicTencentSongListQuery {
    /**
     * @description 歌单tid
     * @example 1207922987
     */
    disstid: number;
}
export interface MusicTencentSongUrlQuery {
    /**
     * @description 歌曲mid
     * @example 000wwOOX2dQqj1
     */
    songmid: string;
}
export interface MusicTencentLyricQuery {
    /**
     * @description 歌曲mid
     * @example 000wwOOX2dQqj1
     */
    songmid: string;
}
export interface MusicTencentSearchQuery {
    /**
     * @description 歌曲名关键字
     * @example 上里与手抄卷
     */
    keyword: string;
    /** @description 分页 */
    page?: number;
    /** @description 每页个数 */
    pageSize?: number;
}
