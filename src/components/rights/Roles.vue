<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolelist" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="['bdbottom', index2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      v-for="(item3, index3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      :class="[
                        'bdbottom',
                        index3 === 0 ? '' : 'bdtop',
                        'vcenter',
                      ]"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="角色操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="30%"
      @closed="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="30%"
      @closed="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="SetRightdialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights" 
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      //添加角色的信息
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名长度在2到10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色描述长度在2到10个字符之间",
            trigger: "blur",
          },
        ],
      },
      editDialogVisible: false, //编辑角色信息对话框的隐藏与显示
      editForm: {
        roleName: "",
        roleDesc: "",
      }, //编辑角色信息数据，根据id查询到用户对象
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名长度在2到10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色描述长度在2到10个字符之间",
            trigger: "blur",
          },
        ],
      },
      //控制分配权限的对话框显示与隐藏
      SetRightdialogVisible: false,
      //所有权限的数据
      rightslist: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: 'children',
      },
      //设置树形控件中默认选中的内容
      defKeys: [],
      //保存正在操作的角色id
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      //获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolelist = res.data;
    },
    addDialogClosed() {
      //添加角色对话框关闭之后，重置对话框
      this.$refs.addFormRef.resetFields();
    },
    addRoles() {
      //点击确定按钮添加新角色
      //先进行表单验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请填写完整角色信息");
        const { data: res } = await this.$http.post("roles/", this.addForm);
        // console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色成功");
        //关闭对话框
        this.addDialogVisible = false;
        //重新请求最新的数据
        this.getRolesList();
      });
    },
    //展示修改用户对话框信息，根据传入的id发起请求获得用户信息
    async showEditDialog(id) {
      //   console.log(id);
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(`roles/${id}`);
      //   console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色信息失败");
      this.editForm = res.data;
      console.log(this.editForm.id);
    },
    //关闭修改角色对话框，重置内容
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改角色信息
    editRolesInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请输入完整的角色信息");
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          this.editForm
        );
        // console.log(res);
        // console.log(res.meta.status);
        if (res.meta.status !== 200) {
          return this.$message.error("修改角色信息失败");
        }
        this.$message.success("修改角色信息成功");
        this.editDialogVisible = false;
        this.getRolesList();
      });
    },
    //删除角色
    async removeRolesById() {
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
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.$message.success("删除用户成功");
      this.getRolesList();
    },
    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //判断用户是否删除
      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      //无需再重新加载所有权限
      //只需要对现有的角色权限进行更新即可
      // this.getRoleList();
      role.children = res.data;
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      //获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }
      //把获取的权限数据保存到this.rightslist
      this.rightslist = res.data;
      //递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
      //展示或隐藏对话框
      this.SetRightdialogVisible = !this.SetRightdialogVisible;
      //把id保留到data中
      this.roleId = role.id
    },
    //通过递归的形式获取角色下所有三级权限的id，并保留到defKeys中
    getLeafKeys(node,arr){
      //如果node节点不包含children属性，则为三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDialogClosed(){
      this.defKeys=[]
    },
    //点击为角色分配权限
    async allotRights(){
      const keys = [
        //获取所有选中及半选的内容
        ...this.$refs.treeRef.getCheckedKeys(), 
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      
      const {data:res }= await this.$http.post(`roles/${this.roleId}/rights`,{
        rids:idStr
      })
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.SetRightdialogVisible = false

    }

  },
};
</script>

<style lang="less" scope>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #ddd;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>