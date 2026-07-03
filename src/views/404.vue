<template>
  <div class="not-found">
    <div class="container">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <button @click="goBack" class="back-button">返回上一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

document.title = 'Ohhhhh - 页面未找到'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f8f9fa;
}

.container {
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  color: #343a40;
  margin: 0;
  line-height: 1.2;
}

p {
  font-size: 1.25rem;
  color: #6c757d;
  margin: 1rem 0 2rem;
}

.back-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #0056b3;
}
</style>
