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
//导入TreeTable,用于商品分类
import TreeTable from 'vue-table-with-tree-grid'
import axios from "axios"
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
