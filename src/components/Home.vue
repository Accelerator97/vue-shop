<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="home-header">
        <div class="home-headerLogo">
          <img src="../assets/login-logo.jpg" alt="" />
        </div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 左边侧边栏 -->
      <!-- 根据折叠情况动态伸缩侧边栏的宽度 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- 从数据库中获得数据，渲染到页面上，每个一级菜单动态绑定唯一的index -->
          <!-- index接受的是字符串，数据库中传的是数字，后面加上一个空的字符串 转为字符串 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单的模版区域 -->
            <template slot="title">
              <!-- 一级菜单图标 -->
              <!-- 动态绑定 每次循环时根据一级菜单的id添加对应的图标属性 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 一级菜单文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <!-- 从数据库中获得数据，渲染到页面上，每个二级菜单动态绑定唯一的index -->
            <!-- 开启路由跳转，手动添加斜线，作为路由的跳转地址-->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主内容 -->
      <el-main>
          <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconsObj: {
        //每个菜单的id对应的图标
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false, //默认不折叠
      activePath:''//保存被激活链接的地址
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //点击退出按钮，清空token，跳转登录页
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login"); //重定向跳转到登录页
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      // console.log(res);
      this.menulist = res.data;
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }

  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center; //弹性盒模型 按钮会铺满整个盒子，所以设置垂直居中
  padding-left: 10px;
  color: #fff;
  font-size: 20px;
}
.home-header {
  height: inherit;
  border-radius: 50%;
  display: flex;
  align-items: center;
}
.home-headerLogo {
  height: inherit;
}
.home-header .home-headerLogo > img {
  height: inherit; //只设置高度继承父盒子，避免图片变形
  border-radius: 50%;
}
.home-header span {
  margin-left: 15px;
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px; //菜单名与菜单图标距离
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em; //每条竖线之间间隔
  cursor: pointer;
}
</style>