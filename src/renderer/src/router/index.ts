/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as VueRouter from 'vue-router'
const routes = [
  { path: '/', component: () => import('@renderer/pages/Chat.vue') },
  { path: '/chat', component: () => import('@renderer/pages/Chat.vue') },
  { path: '/set', component: () => import('@renderer/pages/Set.vue') }
]
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})
export { router }
