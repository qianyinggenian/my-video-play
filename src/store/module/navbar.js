export default {
  namespaced: true,
  state: {
    tabs: JSON.parse(sessionStorage.getItem('tabs')) || []
  },
  getters: {},
  mutations: {
    /**
     * @Description 关闭单个
     * @author qianyinggenian
     * @date 2023/9/15
     */
    SET_CLOSE_TAB: (state, params) => {
      state.tabs = state.tabs.filter(value => value.path !== params.path);
    },
    /**
     * @Description 关闭所有
     * @author qianyinggenian
     * @date 2023/9/15
     */
    SET_CLOSE_ALL_TABS: (state, params) => {
      console.log(params);
      state.tabs = [];
    },
    /**
     * @Description 关闭其他
     * @author qianyinggenian
     * @date 2023/9/15
     */
    SET_CLOSE_OTHER_TABS: (state, params) => {
      state.tabs = state.tabs.filter(value => value.path === params.path);
    },
    /**
     * @Description 关闭右侧
     * @author qianyinggenian
     * @date 2023/9/21
     */
    SET_CLOSE_RIGHT: (state, index) => {
      state.tabs = state.tabs.slice(0, index + 1);
    },
    /**
     * @Description 添加
     * @author qianyinggenian
     * @date 2023/9/15
     */
    SET_ADD_TAB: (state, params) => {
      const index = state.tabs.findIndex(value => value.path === params.path);
      if (index === -1) {
        const item = {
          ...params,
          label: params.meta.title
        };
        state.tabs.push(item);
      }
    }
  },
  actions: {}
};
