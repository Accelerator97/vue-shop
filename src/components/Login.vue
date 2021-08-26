<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/login-logo.jpg" />
      </div>
      <!-- 登录表单区 -->
      <el-form
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <!-- prop传入用户名的受限规则 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
            type="text"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <!-- prop传入密码的受限规则 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //登录表单的数据绑定对象
      loginForm: {
        username: "admin", //默认值
        password: "123456",//默认值
      },
      //表单的验证规则对象
      loginFormRules: {
        username: [ //规则写成数组形式
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [ //规则写成数组形式
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
      },
    };
  },
  methods:{
    //点击重置按钮，重置登录表单
    //获取元素实例，然后调用resetFields方法
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields();
    },
    login(){
      this.$refs.loginFormRef.validate(async(valid)=>{ //先验证表单是否完整
        if(!valid) return;
        //表单完整，然后发送请求，请求回来的结果解构赋值，然后重命名为res
        const {data:res} = await this.$http.post('login',this.loginForm) //第一个参数是请求地址 第二个时携带的参数
        // console.log(res);
        if(res.meta.status !== 200) return this.$message.error('登录失败')
        //1.显示登录成功对话框
        this.$message.success('登录成功')
        // console.log(res)
        //2.登陆成功之后的token 保存在客户端的sessionStorage
        // console.log(window.sessionStorage);
        window.sessionStorage.setItem("token",res.data.token) //储存token到本地
        //3.通过编程示导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
};
</script>

<style lang="less" scoped>
.login_container { //铺满全屏
  background-color: #2b5b6b;
  height: 100%;
}
.login_box { //登录框
  width: 450px;
  height: 300px;
  background-color: #eee;
  border-radius: 3px;
  position: absolute;//父元素没有设置定位，所以相对于html元素来定位
  left: 50%; //登录框垂直居中显示
  top: 50%;//登录框垂直居中显示
  transform: translate(-50%, -50%);//登录框垂直居中显示
  .avatar_box { //头像框
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px; //设置了圆环的效果
    box-shadow: 0 0 10px #ddd; //边框阴影
    position: absolute;//父元素设置了绝对定位，相对于.login_box定位
    left: 50%;//水平居中
     transform: translate(-50%,-50%);//水平居中  往上挪50%
    background-color: #fff;
    img { //头像框图片
      width: 100%;//图片占满.avatar_box
      height: 100%;//图片占满.avatar_box
      border-radius: 50%;
      background-color: #ddd;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}

.login_form {
  //头像框脱标，登录表单往上顶，所以设置绝对定位，让其靠下显示
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box; //不加这个 登录表单会超出登录框
}
</style>