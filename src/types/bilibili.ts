export interface BilibiliInfo {
    /** 用户ID */
    mid: number;
    /** 昵称 */
    name: string;
    /** 性别 */
    sex: string;
    /** 头像 */
    face: string;
    face_nft: number;
    face_nft_type: number;
    /** 个性签名 */
    sign: string;
    rank: number;
    /** 等级 */
    level: number;
    jointime: number;
    moral: number;
    silence: number;
    coins: number;
    fans_badge: boolean;
    /** 粉丝勋章 */
    fans_medal: {
        show: boolean;
        wear: boolean;
        medal: {
            uid: number;
            target_id: number;
            medal_id: number;
            /** 勋章等级 */
            level: number;
            /** 勋章名称 */
            medal_name: string;
            medal_color: number;
            intimacy: number;
            next_intimacy: number;
            day_limit: number;
            medal_color_start: number;
            medal_color_end: number;
            medal_color_border: number;
            is_lighted: number;
            light_status: number;
            wearing_status: number;
            score: number;
        };
    };
    official: {
        role: number;
        title: string;
        desc: string;
        type: number;
    };
    /** 会员信息 */
    vip: {
        type: number;
        status: number;
        /** 到期时间 */
        due_date: number;
        vip_pay_type: number;
        theme_type: number;
        label: {
            path: string;
            text: string;
            label_theme: string;
            text_color: string;
            bg_style: number;
            bg_color: string;
            border_color: string;
            use_img_label: boolean;
            img_label_uri_hans: string;
            img_label_uri_hant: string;
            img_label_uri_hans_static: string;
            img_label_uri_hant_static: string;
        };
        avatar_subscript: number;
        nickname_color: string;
        role: number;
        avatar_subscript_url: string;
        tv_vip_status: number;
        tv_vip_pay_type: number;
        tv_due_date: number;
        avatar_icon: {
            icon_type: number;
            icon_resource: Record<string, never>;
        };
    };
    pendant: {
        pid: number;
        name: string;
        image: string;
        expire: number;
        image_enhance: string;
        image_enhance_frame: string;
        n_pid: number;
    };
    nameplate: {
        nid: number;
        name: string;
        image: string;
        image_small: string;
        level: string;
        condition: string;
    };
    user_honour_info: {
        mid: number;
        colour: null;
        tags: string[];
        is_latest_100honour: number;
    };
    is_followed: boolean;
    /** 个人中心图片 */
    top_photo: string;
    theme: Record<string, never>;
    sys_notice: Record<string, never>;
    live_room: {
        roomStatus: number;
        liveStatus: number;
        url: string;
        title: string;
        cover: string;
        roomid: number;
        roundStatus: number;
        broadcast_type: number;
        watched_show: {
            switch: boolean;
            num: number;
            text_small: string;
            text_large: string;
            icon: string;
            icon_location: string;
            icon_web: string;
        };
    };
    birthday: string;
    school: {
        name: string;
    };
    profession: {
        name: string;
        department: string;
        title: string;
        is_show: number;
    };
    tags: null;
    series: {
        user_upgrade_status: number;
        show_upgrade_window: boolean;
    };
    is_senior_member: number;
    mcn_info: null;
    gaia_res_type: number;
    gaia_data: null;
    is_risk: boolean;
    elec: {
        show_info: {
            show: boolean;
            state: number;
            title: string;
            icon: string;
            jump_url: string;
        };
    };
    contract: null;
    certificate_show: boolean;
    name_render: null;
}
export interface BilibiliFavorite {
    /** 总数 */
    count: number;
    /** 列表 */
    list: {
        /** 收藏夹ID */
        id: number;
        fid: number;
        mid: number;
        attr: number;
        /** 收藏夹名称 */
        title: string;
        fav_state: number;
        /** 列表个数 */
        media_count: number;
    }[];
    season: null;
}
export interface BilibiliResource {
    /** 收藏夹信息 */
    info: {
        /** 收藏夹ID */
        id: number;
        fid: number;
        mid: number;
        attr: number;
        /** 收藏夹名称 */
        title: string;
        /** 收藏夹封面 */
        cover: string;
        upper: {
            mid: number;
            name: string;
            face: string;
            followed: boolean;
            vip_type: number;
            vip_statue: number;
        };
        cover_type: number;
        cnt_info: {
            collect: number;
            play: number;
            thumb_up: number;
            share: number;
        };
        type: number;
        /** 简介 */
        intro: string;
        /** 创建时间 */
        ctime: number;
        /** 更新时间 */
        mtime: number;
        state: number;
        fav_state: number;
        like_state: number;
        /** 内容数量 */
        media_count: number;
    };
    /** 收藏夹内容 */
    medias: {
        id: number;
        type: number;
        /** 内容标题 */
        title: string;
        /** 封面 */
        cover: string;
        /** 简介 */
        intro: string;
        page: number;
        duration: number;
        /** Up主信息 */
        upper: {
            /** Up主ID */
            mid: number;
            /** Up主名称 */
            name: string;
            /** Up主头像 */
            face: string;
        };
        attr: number;
        cnt_info: {
            collect: number;
            play: number;
            danmaku: number;
        };
        link: string;
        ctime: number;
        /** 发布时间 */
        pubtime: number;
        /** 收藏时间 */
        fav_time: number;
        /** bv号 */
        bv_id: string;
        bvid: string;
        season: null;
        ogv: null;
        ugc: {
            first_cid: number;
        };
    }[];
    has_more: boolean;
}
export interface BilibiliFollowing {
    list: {
        mid: number;
        attribute: number;
        mtime: number;
        tag: string[];
        special: number;
        contract_info: {
            is_contractor?: boolean;
            ts?: number;
            is_contract?: boolean;
            user_attr?: number;
        };
        /** Up主昵称 */
        uname: string;
        /** Up主头像 */
        face: string;
        /**
         * 个性签名
         * @description Up主个性签名
         */
        sign: string;
        face_nft: number;
        official_verify: {
            type: number;
            desc: string;
        };
        /** vip信息 */
        vip: {
            vipType: number;
            vipDueDate: number;
            dueRemark: string;
            accessStatus: number;
            vipStatus: number;
            vipStatusWarn: string;
            themeType: number;
            label: {
                path: string;
                text: string;
                label_theme: string;
                text_color: string;
                bg_style: number;
                bg_color: string;
                border_color: string;
            };
            avatar_subscript: number;
            nickname_color: string;
            avatar_subscript_url: string;
        };
    }[];
    re_version: number;
    /** 总数 */
    total: number;
}
export interface BilibiliInfoQuery {
    /**
     * @description B站用户ID
     * @example 315883644
     */
    mid: string;
}
export interface BilibiliFavoriteQuery {
    /**
     * @description B站用户ID
     * @example 315883644
     */
    mid: string;
}
export interface BilibiliResourceQuery {
    /**
     * @description 收藏夹ID
     * @example 162679244
     */
    id: number;
    /**
     * @description 页码
     * @example 1
     */
    page?: number;
    /**
     * @description 每页个数
     * @example 20
     */
    pageSize?: number;
}
export interface BilibiliFollowingQuery {
    /**
     * @description B站用户ID
     * @example 315883644
     */
    mid: string;
}
