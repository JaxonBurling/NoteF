import { defineStore } from 'pinia'
import { getMemoListApi, getMemoDetailApi, deleteMemoApi, addMemoApi } from '../api'

export const useMemoStore = defineStore('memo', {
  state: () => ({
    memoList: [] as any[],
    detail: null as any,
  }),
  actions: {
    async fetchMemoList() {
      this.memoList = await getMemoListApi()
    },
    async fetchMemoDetail(id: string) {
      this.detail = await getMemoDetailApi(id)
      return this.detail
    },
    async deleteMemo(id: string) {
      await deleteMemoApi(id)
      await this.fetchMemoList()
    },
    async addMemo(data: any, onProgress?: (p: number) => void) {
      await addMemoApi(data, onProgress)
      await this.fetchMemoList()
    },
  },
})
