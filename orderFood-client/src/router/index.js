import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/order'
  },
  {
    path: '/order',
    name: 'order',
    component: () => import('../views/OrderView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
