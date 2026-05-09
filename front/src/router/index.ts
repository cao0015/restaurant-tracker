import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// hash 路由：dist/ 打包后可以直接用浏览器打开 index.html，无需 web 服务器
export default createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: HomeView }],
})
