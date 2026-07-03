import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    key: localStorage.getItem('memo_key') || '',
  }),
  actions: {
    setKey(key: string) {
      this.key = key
      localStorage.setItem('memo_key', key)
    },
  },
})
