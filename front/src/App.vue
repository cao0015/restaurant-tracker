<template>
  <el-container>
    <el-header class="app-header">
      <div class="logo">🍜 我的餐厅记录</div>
      <span class="subtitle">吃过的每一家，都值得被记住</span>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.logo {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}
.subtitle {
  font-size: 13px;
  color: #aaa;
}
@media (max-width: 640px) {
  .subtitle {
    display: none;
  }
}
</style>

<style>
* { box-sizing: border-box; }
body { margin: 0; background: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
@media (max-width: 640px) {
  .el-dialog {
    width: 92vw !important;
    margin: 0 auto;
  }
}
</style>
