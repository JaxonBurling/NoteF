import axios from 'axios'
import { useUserStore } from '../stores/user'
import { useMemoStore } from '@/stores/memo'
import type { DialogForm } from '@/views/Add.vue'

const baseURL = '/api'

// 校验 key
export async function checkKeyApi(key: string) {
  try {
    const res = await axios.post(`${baseURL}/verify`, { code: key })
    return res.data.code === 200
  } catch {
    return false
  }
}

// 一键登录识别码
export async function getCodeIdApi() {
  const res = await axios.get(`${baseURL}/code_id`)
  return res.data.code_id || ''
}

// 获取备忘录列表
export async function getMemoListApi() {
  const userStore = useUserStore()
  const res = await axios.get(`${baseURL}/memo`, { headers: { 'X-Key': userStore.key } })
  // api.py 返回 memo 字段
  return res.data.memo || []
}

// 获取备忘录详情
export async function getMemoDetailApi(id: string | number) {
  const userStore = useUserStore()
  const res = await axios.get(`${baseURL}/memo`, {
    headers: { 'X-Key': userStore.key },
    params: { id },
  })
  // api.py 返回 title, text, file
  return {
    id: res.data.id,
    title: res.data.title,
    text: res.data.text,
    file: res.data.file,
    time: res.data.time,
    label: res.data.label,
  }
}

// 删除备忘录
export async function deleteMemoApi(id: string | number) {
  const userStore = useUserStore()
  await axios.delete(`${baseURL}/memo/${id}`, { headers: { 'X-Key': userStore.key } })
}

// 新增备忘录
export async function addMemoApi(
  data: { title: string; text: string; files?: File[]; label?: DialogForm[]; mail_sync?: boolean },
  onProgress?: (p: number) => void,
) {
  const userStore = useUserStore()
  const form = new FormData()
  form.append('title', data.title)
  form.append('text', data.text)
  form.append('mail_sync', Boolean(data.mail_sync).toString())
  form.append('label', JSON.stringify(data.label))
  ;(data.files || []).forEach((f: File) => form.append('file', f))

  await axios.post(`${baseURL}/memo`, form, {
    headers: { 'X-Key': userStore.key },
    onUploadProgress: (e: import('axios').AxiosProgressEvent) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}

// 下载文件
export async function downloadFileApi(id: string | number, fileName: string, save: boolean = true) {
  const userStore = useUserStore()
  const url = `${baseURL}/download?id=${id}&mid=${useMemoStore().detail.id}${save ? '&save=1' : ''}`
  return axios
    .get(url, {
      headers: { 'X-Key': userStore.key },
      responseType: 'blob',
    })
    .then((res: { data: Blob }) => {
      if (save) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(res.data)
        link.download = fileName
        link.click()
        URL.revokeObjectURL(link.href)
      } else return res.data
    })
}
