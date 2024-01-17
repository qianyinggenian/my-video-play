import Vue from 'vue';
import App from './App.vue';
import 'babel-polyfill';
import router from './router';
import store from './store';
import '@/css/index.scss';
import Vant from 'vant';
import './components/index.js';
import '@/common/icons/index';
import 'vant/lib/index.css';
// 引入视频播放器js
import videojs from 'video.js';
// 视频播放器样式文件
import 'video.js/dist/video-js.css';
// 引入播放器语言-中文
import videoZhCN from 'video.js/dist/lang/zh-CN.json';
import VueTouch from 'vue-touch';
videojs.addLanguage('zh-CN', videoZhCN);
Vue.use(Vant);
Vue.config.productionTip = false;
Vue.prototype.$videojs = videojs;
Vue.prototype.$_store = store;
VueTouch.registerCustomEvent('doubletap', {
  type: 'tap',
  taps: 2
});
Vue.use(VueTouch, { name: 'v-touch' });
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
