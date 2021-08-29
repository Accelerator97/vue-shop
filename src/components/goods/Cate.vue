<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加商品分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序区域 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作区域 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showeditDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFomrRules"
        ref="addCateFormRef"
        label-width="100px"
        @close="addCateDialogClosed"
      >
        <!-- 主体区 -->
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称:">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            ref="cascaderHandle"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改分类的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
      </tree-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询参数条件，发送请求获得商品分类数据
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类的数据列表
      catelist: [],
      //共有多少条商品分类
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template", //将该列设置为模板列
          template: "isok", //设置该列模板的名称为isok
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        { 
          label: "操作", 
          prop: "", 
          type: "template", 
          template: "opt" },
      ],
      addCateDialogVisible: false, //控制添加分类对话框的显示与隐藏
      addCateForm: {
        //添加分类的表单数据对象
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      addCateFomrRules: {
        //添加分类表单的验证规则
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      parentCateList: [], //保存父级分类的列表
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children", //以哪个节点进行嵌套
        expandTrigger: "hover",
        checkStrictly: true,
      },
      //选中的父级分类的id数组
      selectedKeys: [],
      editDialogVisible: false,
      editForm: {
        cat_name: "",
      },
      editFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      // console.log(res.data);
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      //   console.log(this.querInfo);
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    //点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList();
      //再展示对话框
      this.addCateDialogVisible = true;
    },
    //在添加分类的表单中，获取父级分类的数据列表
    async getParentCateList() {
      //获取父级分类数据列表
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类列表数据失败");
      }
      this.parentCateList = res.data;
    },
    parentCateChanged() {
      //选择项发生变化触发这个函数
      console.log(this.selectedKeys);
      //选择父类
      if (this.selectedKeys.length > 0) {
        //则将数组中的最后一项设置为父级分类
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        //level也要跟着发生变化
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
<<<<<<< HEAD
      this.$refs.cascaderHandle.dropDownVisible = false
=======
      this.$refs.cascaderHandle.dropDownVisible = false;
>>>>>>> goods_cate
    },
    addCateDialogClosed() {
      //当关闭添加分类对话框时，重置表单
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    addCate() {
      //点击确定，完成添加分类
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        //发送请求完成添加分类
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }

        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    async showeditDialog(cate) {
      // console.log(cate.cat_id);

      const { data: res } = await this.$http.get(`categories/${cate.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editFormConfirm() {
      console.log(this.editForm);
      // console.log(this.cateList);
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.info("请输入完整");
        }
        const { data: res } = await this.$http.put(
          "categories/" + this.editForm.cat_id,
          this.editForm
        );
        console.log(res);
        //判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error("修改分类失败");
        //修改成功的提示
        this.$message.success("修改分类成功");
        //关闭对话框
        this.editDialogVisible = false;
        //重新请求最新的数据
        this.getCateList();
      });
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    async removeCateById(row) {
      //弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        "请问是否要删除该分类",
        "删除提示",
        {
          confirmButtonText: "确认删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //如果用户点击确认，则confirmResult 为'confirm'
      //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult != "confirm") {
        return this.$message.info("已经取消删除");
      }

      //用户点击了确定表示真的要删除
      //当发送delete请求之后，返回的数据就是最新的角色权限信息
      const { data: res } = await this.$http.delete(
        `categories/${row.cat_id}`
      );
      if (res.meta.status !== 200)
        return this.$message.error("删除分类失败");
      this.$message.success('删除分类成功')
      this.getCateList()
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>