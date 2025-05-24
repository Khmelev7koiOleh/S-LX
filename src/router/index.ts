import { createRouter, createWebHistory } from 'vue-router'

import DynamicId from '../components/DynamicId.vue'
import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'
// import ContactView from '../views/ContactView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },

    {
      path: '/about',
      name: 'about',

      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/ad/:id', // dynamic route
      name: 'AdDetail',
      component: DynamicId,
      props: true,
    },
  ],
})

export default router
