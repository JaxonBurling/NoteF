<template>
  <el-card class="verify-card">
    <el-tabs default-value="key" stretch="true">
      <el-tab-pane label="密钥登录" key="key">
        <el-image :src="codeUrl" style="width: 100px; height: 50px" />
        <el-input
          v-model="key"
          placeholder="请输入通行密钥"
          style="margin-bottom: 16px; align-items: center"
        />
        <el-button type="primary" @click="checkKey" :loading="loading">验证</el-button>
        <div v-if="error" class="error">{{ error }}</div>
      </el-tab-pane>
      <el-tab-pane label="YAuth" key="yauth">
        <p style="margin-bottom: 16px">请点击下方按钮进行登录</p>
        <el-button type="primary" @click="yauth_login" :loading="loading">登录</el-button>
      </el-tab-pane>
      <el-tab-pane label="一键登录" key="ext">
        <p v-if="!login_modlue" style="color: #f56c6c">当前环境不支持一键登录，请使用密钥登录</p>
        <div v-else style="color: #67c23a; margin-bottom: 16px">
          <p>模块版本: {{ ext_version }}</p>
          <el-button type="primary" @click="ext_login" id="ext_button">一键登录</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { checkKeyApi } from '../api'
import { ElMessage } from 'element-plus'
import { ro } from 'element-plus/es/locales.mjs'

document.title = 'Verify'

const key = ref('')
const codeUrl = ref('')
const codeId = ref('')
const error = ref('')
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()
const login_modlue = ref(false)
const ext_version = ref(0.0)

onMounted(() => {
  const localKey = userStore.key
  if (localKey) {
    loading.value = true
    checkKeyApi(localKey).then((valid) => {
      loading.value = false
      if (valid) {
        router.replace('/')
      } else {
        error.value = '密钥无效，请重新输入'
        userStore.setKey('')
      }
    })
  }
  fetch('/api/code').then(async (res) => {
    res.blob().then((blob) => {
      codeUrl.value = URL.createObjectURL(blob)
    })
    codeId.value = res.headers.get('X-Code-Id') || ''
  })
  login_modlue.value = document.getElementById('login_modlue')?.innerText === 'YHP'
  if (login_modlue.value) {
    postMessage({ type: 'get_module_version', source: 'webview' }, '*')
  }
})

function checkKey() {
  if (!key.value) {
    error.value = '请输入验证码结果'
    return
  }
  if (!codeId.value) {
    error.value = '验证码已过期，请刷新页面'
    return
  }
  loading.value = true
  fetch('/api/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code_id: codeId.value, code: key.value }),
  })
    .then((res) => res.json())
    .then((data) => {
      loading.value = false
      if (data.code === 200 && data.key) {
        userStore.setKey(data.key)
        router.replace('/')
      } else {
        error.value = data.msg || '验证失败'
        // 刷新验证码
        fetch('/api/code').then(async (res) => {
          res.blob().then((blob) => {
            codeUrl.value = URL.createObjectURL(blob)
          })
          codeId.value = res.headers.get('X-Code-Id') || ''
        })
        key.value = ''
      }
    })
    .catch(() => {
      loading.value = false
      error.value = '网络错误，请重试'
    })
}
function ext_login() {
  ElMessage.info('一键登录功能正在开发中，敬请期待')
}
function yauth_login() {
  location.replace(
    (import.meta.env.MODE === 'development'
      ? 'http://127.0.0.1:5173'
      : 'https://auth.overpass.top') +
      '/oauth/authorize?appid=3&redirect_url=https://note.overpass.top/oauth/authorize&state=Note2026&scope=all',
  )
}

addEventListener('message', (event) => {
  const msg = event.data
  if (msg.source === 'ext_login') {
    switch (msg.type) {
      case 'module_version':
        ext_version.value = msg.data
        break
      default:
        break
    }
  }
})
</script>

<style scoped>
.verify-card {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px;
}
.error {
  color: #f56c6c;
  margin-top: 12px;
}
</style>
