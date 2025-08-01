import { createRouter, createWebHistory } from 'vue-router'

import DynamicId from '../components/DynamicId.vue'
import ChatMessageComponent from '../components/ChatMessageComponent.vue'
import HomeView from '../views/HomeView.vue'
import Check from '../components/Check.vue'
import UserProfile from '../components/user-profile/UserProfile.vue'

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
      path: '/chats',
      name: 'chats',
      component: () => import('../views/Chats.vue'),
    },

    {
      path: '/about',
      name: 'about',

      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      children: [
        {
          path: 'my-profile-ads',
          name: 'my-profile-ads',
          components: {
            main: () => import('../components/MyAdsProfile.vue'),
          },
        },
        {
          path: 'my-profile-profile',
          name: 'my-profile-profile',
          components: {
            main: () => import('../components/MyProfileProfile.vue'),
          },
        },
        {
          path: 'my-profile-settings',
          name: 'my-profile-settings',
          components: {
            main: () => import('../components/MyProfileSettings.vue'),
          },
        },
        {
          path: 'my-profile-chats',
          name: 'my-profile-chats',
          components: {
            main: () => import('../components/MyProfileChats.vue'),
          },
        },
        {
          path: 'my-profile-ratings',
          name: 'my-profile-ratings',
          components: {
            main: () => import('../components/MyProfileRatings.vue'),
          },
        },
      ],
    },
    {
      path: '/ad/:id', // dynamic route
      name: 'AdDetail',
      component: DynamicId,
      props: true,
    },
    {
      path: '/chats/:id', // dynamic route
      name: 'Check',
      component: Check,
      props: true,
    },
    {
      path: '/user-profile/:id', // dynamic route
      name: 'UserProfile',
      component: UserProfile,
      props: true,
    },

    // {
    //   path: '/chats/:id', // dynamic route
    //   name: 'chat',
    //   component: ChatMessageComponent,
    //   props: true,
    // },
  ],
})

export default router
