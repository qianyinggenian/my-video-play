import Vue from 'vue';
import VueRouter from 'vue-router';
// import login from '../views/login';
import layout from '../views/layout';
import errorView from '../views/404';
import { config } from '@/router/config';
import { getToKen, getRefreshToken } from '@/common/Cookie';
import constants from '@/common/constants';
import store from '@/store';
import home from '@/views/home';
Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    name: 'home',
    component: home,
    meta: {
      title: '登录'
    }
  },
  {
    path: '*',
    name: '404',
    component: errorView,
    meta: {
      title: '未找到'
    }
  },
  {
    path: '/layout',
    name: 'layout',
    component: layout,
    redirect: '/home',
    children: [
      ...config
    ]
  }
];
const router = new VueRouter({
  mode: 'hash',
  // base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  if (constants.whiteRequestList.includes(to.path)) {
    next();
    return;
  }
  if (getToKen() !== undefined || getRefreshToken() !== undefined) {
    next();
  } else {
    sessionStorage.clear();
    store.commit('navbar/SET_CLOSE_ALL_TABS', {});
    // next('/login');
    next();
  }
  // next();
});
export default router;
