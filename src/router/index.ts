import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { checkKeyApi } from '@/api'

const routes = [
  { path: '/verify', component: () => import('@/views/Verify.vue') },
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/detail/:id', component: () => import('@/views/Detail.vue') },
  { path: '/add', component: () => import('@/views/Add.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/404.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (!userStore.key && to.path !== '/verify') {
    next('/verify')
  } else {
    checkKeyApi(userStore.key).then((valid) => {
      if (!valid && to.path !== '/verify') {
        userStore.setKey('')
        next('/verify')
      } else {
        next()
      }
    })
  }
})

export default router
