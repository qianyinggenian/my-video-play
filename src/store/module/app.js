export default {
  namespaced: true,
  state: {
    systemName: '浅影歌年', // 系统标题
    // 个人信息
    personalMsg: JSON.parse(sessionStorage.getItem('personalMsg')) || {
      username: '',
      userId: '',
      account: ''
    },
    isCollapse: false,
    // 是否显示水印， 1-是，0-否
    isShowWaterMark: sessionStorage.getItem('waterMark') || '0',
    // 水印显示区域， system-系统，module-模块
    waterMarkArea: sessionStorage.getItem('waterMarkArea') || 'system',
    // 网站是否置灰， 1-是，0-否
    isGreyOut: sessionStorage.getItem('isGreyOut') || '0',
    // logo url
    logoUrl: require('@/assets/logo.png'),
    // 头像url
    avatarUrl: require('@/assets/logo.png')
  },
  mutations: {
    SET_COLLAPSE: (state, value) => {
      state.isCollapse = value;
    },
    SET_USER_MSG: (state, value) => {
      state.personalMsg = value;
      sessionStorage.setItem('personalMsg', JSON.stringify(value));
    },
    SET_WATER_MARK: (state, value) => {
      state.isShowWaterMark = value;
      sessionStorage.setItem('waterMark', value);
    },
    SET_WATER_MASK_AREA: (state, value) => {
      state.waterMarkArea = value;
      sessionStorage.setItem('waterMarkArea', value);
    },
    SET_GREY_OUT: (state, value) => {
      state.isGreyOut = value;
      sessionStorage.setItem('isGreyOut', value);
    },
    SET_MOVE_LEN: (state, value) => {
      state.moveLen = value;
    },
    SET_LOGOUT: (state, value) => {
      state.isLogout = value;
    }
  },
  actions: {},
  getters: {}
};
