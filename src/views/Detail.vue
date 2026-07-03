<template>
  <el-card>
    <div class="detail-header">
      <div>
        <h2>{{ memo.title }}</h2>
        <div>
          ID: {{ memo.id }} | 时间: {{ new Date(Number(memo.time) * 1000).toLocaleString() }}
        </div>
      </div>
      <el-button type="danger" @click="deleteMemo">删除</el-button>
    </div>
    <div style="width: 100%; margin-bottom: 10px">
      <label>标签</label>
      <el-tag
        v-for="tag in memo.label"
        :key="tag"
        :type="tag.type == 'relate' ? 'warning' : 'primary'"
        @click="handleLabelClick(tag)"
        style="margin-left: 5px; cursor: pointer"
        >{{
          tag.name +
          (tag.display ? ' | ' + tag.display : '') +
          (tag.type == 'relate' ? ' | ' + tag.relate : '')
        }}</el-tag
      >
    </div>
    <div class="tag-row">
      <el-tag
        v-for="file in memo.file"
        :key="file.name"
        @click="handleTagClick(file)"
        style="cursor: pointer; margin-right: 8px"
        >{{ file.name }}</el-tag
      >
    </div>
    <el-dialog v-model="imgViewerVisible" width="60%" :show-close="false">
      <el-image-viewer
        v-if="imgViewerVisible"
        :url-list="[imgUrl]"
        @close="imgViewerVisible = false"
      />
    </el-dialog>
    <el-input type="textarea" :model-value="memo.text" rows="10" readonly />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMemoStore } from '@/stores/memo'
import { downloadFileApi } from '../api'
import type { DialogForm } from './Add.vue'
import { ElMessage } from 'element-plus'

document.title = '备忘录详情'

interface MemoFile {
  id: string
  name: string
}

interface MemoDetail {
  id: string
  title: string
  time: string
  file: MemoFile[]
  text: string
  label: DialogForm[]
}

const route = useRoute()
const router = useRouter()
const memoStore = useMemoStore()
const memo = ref<MemoDetail>({ id: '', title: '', time: '', file: [], text: '', label: [] })
const imgViewerVisible = ref(false)
const imgUrl = ref('')

onMounted(async () => {
  const id = route.params.id as string
  memo.value = await memoStore.fetchMemoDetail(id)
  console.log(memo.value.label)
})
watch(
  () => route.params.id,
  async (id) => {
    if (id) memo.value = await memoStore.fetchMemoDetail(id as string)
  },
  { immediate: true },
)

function handleTagClick(file: MemoFile) {
  if (
    file.name.endsWith('.png') ||
    file.name.endsWith('.jpg') ||
    file.name.endsWith('.bmp') ||
    file.name.endsWith('.gif') ||
    file.name.endsWith('.ico')
  ) {
    downloadFileApi(file.id, '', false).then((d) => {
      imgUrl.value = URL.createObjectURL(d || new Blob())
      imgViewerVisible.value = true
    })
  } else {
    downloadFileApi(file.id, file.name)
  }
}
function handleLabelClick(tag: DialogForm) {
  if (tag.type != 'relate')
    ElMessage({
      message: `标签: ${tag.name}`,
    })
  else router.push(`/detail/${tag.relate}`)
}
function deleteMemo() {
  memoStore.deleteMemo(memo.value.id)
  router.replace('/')
}
</script>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.tag-row {
  margin-bottom: 16px;
}
</style>
