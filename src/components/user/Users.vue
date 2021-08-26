<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <!-- 指定数据源 边框 斑马纹-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 通过作用域插槽接受scope，就可以通过scope.row获得这行的数据 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip
              effect="dark"
              content="修改角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip
              effect="dark"
              content="删除角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改用户对话框主体部分 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名称">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 修改用户对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="SetRoledialogVisible"
      width="50%"
      @close ="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{ this.userInfo.username }}</p>
        <p>当前的角色：{{ this.userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="SaveRoleInfo"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的规则
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        return cb();
      }
      //返回一个错误提示
      cb(new Error("请输入合法的邮箱"));
    };
    var checkMobile = (rule, value, cb) => {
      //自定义手机号的验证规则
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      //返回一个错误提示
      cb(new Error("请输入合法的手机号码"));
    };
    return {
      //获取用户列表参数的对象
      queryInfo: {
        query: "",
        pagenum: 1, //当前页数
        pagesize: 2, //当前页数显示多少条数据
      },
      userList: [],
      total: 0, //用户总数
      addDialogVisible: false, //控制添加用户对话框的显示与隐藏
      addForm: {
        //添加用户的表单数据
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      addFormRules: {
        //添加表单的验证规则对象
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3到10个字符之间",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名长度在6到15个字符之间",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editDialogVisible: false, //控制修改用户对话框的显示与隐藏
      editForm: {
        //根据id查询到的用户信息对象
        username: "",
        email: "",
        mobile: "",
      },
      editFormRules: {
        //修改用户对话框的验证规则
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      SetRoledialogVisible: false, //控制分配角色对话框的显示与隐藏
      userInfo: [], //需要被分配角色的用户
      roleList: [], //所有角色的数据
      selectedRoleId:[]//已选中的角色Id值
    };
  },
  created() {
    this.getUserList(); //页面创建的时候发起ajax请求，请求参数看接口文档
  },
  methods: {
    async getUserList() {
      // console.log(this.queryInfo);
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开关状态的改变
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    //监听添加对话框的关闭事件
    addDialogClosed() {
      //对话框关闭之后，重置表达
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addUser() {
      //点击确定按钮，添加新用户
      //调用validate进行表单验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请填写完整用户信息");
        //发送请求完成添加用户的操作
        const { data: res } = await this.$http.post("users", this.addForm);
        //判断如果添加失败，就做提示
        // console.log(res.meta.status);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        //添加成功的提示
        this.$message.success("添加用户成功");
        //关闭对话框
        this.addDialogVisible = false;
        //重新请求最新的数据
        this.getUserList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      //根据Id请求用户信息
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //监听修改用户对话框的关闭事件，进行重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息并提交
    editUserInfo() {
      //用户点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请填写完整用户信息");
        //发送请求完成修改用户的操作
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          this.editForm
        );
        console.log(res);
        //判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error("修改用户失败");
        //修改成功的提示
        this.$message.success("修改用户成功");
        //关闭对话框
        this.editDialogVisible = false;
        //重新请求最新的数据
        this.getUserList();
      });
    },
    //根据id删除对应的用户信息
    async removeUserById(id) {
      //询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((error) => error);
      // 如果用户确认删除，则返回字符串confirm
      // 如果用户取消删除，则返回字符串cancel
      if (confirmResult !== "confirm")
        return this.$message.info("已经取消删除");
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.$message.success("删除用户成功");
      this.getUserList();
    },
    //展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;
      //展示对话框之前获取角色的列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      //显示分配角色对话框
      this.SetRoledialogVisible = !this.SetRoledialogVisible;
      console.log(this.selectedRoleId)
    },
    async SaveRoleInfo(){
      console.log(this.selectedRoleId);
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色')
      }
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid:this.selectedRoleId
      })
      if(res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.SetRoledialogVisible = false
    },
    setRoleDialogClosed(){
      this.selectedRoleId=''
      this.userInfo=[]
    }
  },
};
</script>

<style lang="less" scoped>
</style>