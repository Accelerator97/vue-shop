import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome'
import Users from './components/user/Users.vue'


Vue.use(VueRouter)

const router =  new VueRouter({
    routes:[
        {path: '', redirect:'/login'}, //重定向
        {path: '/login',component:Login },
        {path: '/home',
        component: Home ,
        redirect: '/welcome',
        children: [
            {path:'/welcome' ,component:Welcome},
            {path:'/users' ,component:Users}
        ] },
    ]
})
router.beforeEach((to,from,next) =>{ //next是一个函数，执行放行
    if(to.path === "/login") return next()
    // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if(!tokenStr) return next('/login')
    next() 
})

export default router