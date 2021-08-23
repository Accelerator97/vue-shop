import Vue from 'vue'
import App from './App.vue'
// 导入路由
import router from './router.js'
//导入element样式
import './plugins/element.js'
//导入全局样式
import "./assets/css/global.css"
//导入字体图标
import "./assets/fonts/iconfont.css"

import axios from "axios"
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
Vue.prototype.$http = axios

Vue.config.productionTip = false


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
