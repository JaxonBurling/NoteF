<template>
  <el-container style="min-height: 100vh">
    <el-header
      style="
        background: #409eff;
        color: #fff;
        font-size: 22px;
        letter-spacing: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
      "
    >
      备忘录系统
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
body {
  margin: 0;
  background: #f5f7fa;
}
</style>
