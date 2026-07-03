<template>
  <el-card>
    <el-table
      :data="memoList"
      :default-sort="{ prop: 'id', order: 'descending' }"
      style="width: 100%"
      @row-click="goDetail"
    >
      <el-table-column prop="id" label="Id" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="time" label="记录时间" width="180">
        <template #default="scope">
          {{ new Date(Number(scope.row.time) * 1000).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="danger" size="small" @click.stop="deleteMemo(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-button class="fab" type="primary" circle @click="router.push('/add')">
      <el-icon><Plus /></el-icon>
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoStore } from '@/stores/memo'
import { Plus } from '@element-plus/icons-vue'

document.title = 'Note Home'

const router = useRouter()
const memoStore = useMemoStore()
const memoList = computed(() => memoStore.memoList)

onMounted(() => {
  memoStore.fetchMemoList()
})

function goDetail(row: any) {
  router.push(`/detail/${row.id}`)
}
function deleteMemo(id: string) {
  memoStore.deleteMemo(id)
}
</script>

<style scoped>
.fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 10;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
</style>
