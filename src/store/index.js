import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getter';
Vue.use(Vuex);
const modulesFiles = require.context('./module', true, /\.js$/);

// 自动扫描依赖模块
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
  const value = modulesFiles(modulePath);
  modules[moduleName] = value.default;
  return modules;
}, {});
const store = new Vuex.Store({
  modules,
  getters
});

export default store;
