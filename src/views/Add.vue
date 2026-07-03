<template>
  <el-card>
    <div class="add-header">
      <el-input v-model="title" placeholder="请输入标题" style="width: 300px" />
      <el-button type="primary" @click="sendMemo" :loading="sending">发送</el-button>
      <div style="margin-left: 10px">
        <label>邮箱同步</label>
        <el-switch
          v-model="sync_mail"
          style="margin-left: 10px"
          size="large"
          inline-prompt
          active-text="Y"
          inactive-text="N"
        />
      </div>
    </div>
    <div style="width: 100%; margin-bottom: 10px">
      <label>标签</label>
      <el-tag
        v-for="tag in Tags"
        :key="tag"
        closable
        @close="handleClose(tag)"
        :type="tag.type == 'relate' ? 'warning' : 'primary'"
        style="margin-left: 5px"
        >{{
          tag.name +
          (tag.display ? ' | ' + tag.display : '') +
          (tag.type == 'relate' ? ' | ' + tag.relate : '')
        }}</el-tag
      >
      <el-button style="margin-left: 5px" @click="dialog_open = true">添加标签</el-button>
    </div>
    <div class="tag-row">
      <el-upload
        class="upload-btn"
        action=""
        :auto-upload="false"
        :show-file-list="false"
        :multiple="true"
        :on-change="handleFileChange"
        :on-drop="handleDrop"
        drag
      >
        <el-button type="primary" circle
          ><el-icon><Plus /></el-icon
        ></el-button>
      </el-upload>
      <el-tag v-for="file in files" :key="file.name" closable @close="removeFile(file)">{{
        file.name
      }}</el-tag>
    </div>
    <el-input type="textarea" v-model="text" rows="10" placeholder="请输入备忘内容" />
    <el-progress v-if="sending && progress > 0" :percentage="progress" style="margin-top: 16px" />
    <el-dialog v-model="dialog_open" title="Tips">
      <el-form ref="dialogRef" :model="dialog_form" :rules="dialog_rules">
        <el-form-item label="标签名" prop="name">
          <el-input v-model="dialog_form.name" />
        </el-form-item>
        <el-form-item label="标签类型" prop="type">
          <el-select v-model="dialog_form.type">
            <el-option v-for="i in ['normal', 'relate']" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item label="副标签" prop="display">
          <el-input v-model="dialog_form.display" />
        </el-form-item>
        <el-form-item v-if="dialog_form.type == 'relate'" label="引用备忘项" prop="relate">
          <el-input v-model="dialog_form.relate" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleAddLabel(dialogRef)">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoStore } from '../stores/memo'
import { Plus } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, FormRules, FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

document.title = '添加备忘录'

export interface DialogForm {
  name: string
  type: string
  display: string
  relate?: number
}

const title = ref('')
const text = ref('')
const files = ref<any[]>([])
const Tags = ref<DialogForm[]>([])
const dialogRef = ref<FormInstance>()
const dialog_form = reactive<DialogForm>({
  name: '',
  type: 'normal',
  display: '',
  relate: 0,
})
const dialog_rules = reactive<FormRules<DialogForm>>({
  name: [
    {
      required: true,
      message: '请输入标签名',
      trigger: 'blur',
    },
    { min: 2, max: 7, message: '长度限制2~7', trigger: 'change' },
    {
      validator(r, v) {
        for (let i of Tags.value) if (dialog_form.name == i.name) return false
        return true
      },
      message: '不可添加同名标签',
      trigger: 'blur',
    },
  ],
  display: [{ max: 15, message: '副标题不超过15字' }],
  type: [{ enum: ['normal', 'relate'], message: '标签类型错误', trigger: 'change' }],
  relate: [
    {
      required: true,
      type: 'number',

      transform: (v) => {
        return (dialog_form.relate = Number(v))
      },
      message: '请填入引用备忘项的Id',
    },
    {
      validator() {
        return dialog_form.type == 'relate' && dialog_form.relate != 0
      },
      message: '请输入正确的备忘项Id',
    },
  ],
})
const sending = ref(false)
const sync_mail = ref(false)
const dialog_open = ref(false)
const progress = ref(0)
const router = useRouter()
const memoStore = useMemoStore()

function handleClose(tag: DialogForm) {
  Tags.value.splice(Tags.value.indexOf(tag), 1)
}
async function handleAddLabel(form: FormInstance | undefined) {
  if (!form) return
  await form.validate((vaild) => {
    if (!vaild)
      ElMessage({
        type: 'error',
        message: '未通过验证',
      })
    else {
      Tags.value.push({
        name: dialog_form.name,
        type: dialog_form.type,
        display: dialog_form.display,
        relate: dialog_form.relate,
      })

      dialogRef.value?.resetFields()
      dialog_open.value = false
    }
  })
}
function handleFileChange(file: UploadFile, fileList: UploadFiles) {
  files.value = fileList.map((f: any) => f.raw)
}
function handleDrop(e: DragEvent) {
  files.value = [...files.value, ...Array.from(e.dataTransfer?.files || [])]
}
function removeFile(file: any) {
  files.value = files.value.filter((f) => f !== file)
}
async function sendMemo() {
  if (!title.value) return
  sending.value = true
  await memoStore.addMemo(
    {
      title: title.value,
      text: text.value,
      files: files.value,
      label: Tags.value,
      mail_sync: sync_mail.value,
    },
    (p: number) => (progress.value = p),
  )
  sending.value = false
  progress.value = 0
  router.replace('/')
}
</script>

<style scoped>
.add-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.tag-row {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.upload-btn {
  margin-left: 8px;
  width: 200px;
}
</style>
