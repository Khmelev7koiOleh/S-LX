import { createRouter, createWebHistory } from 'vue-router'

// Static import only if critical and very small
import HomeView from '../views/HomeView.vue'

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
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/chats',
      name: 'chats',
      component: () => import('@/views/ChatsView.vue'),
    },
    {
      path: '/ads',
      name: 'ads',
      component: () => import('@/views/AllAdsView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      children: [
        {
          path: 'my-profile-ads',
          name: 'my-profile-ads',
          components: {
            main: () => import('@/components/MyProfileAds.vue'),
          },
        },
        {
          path: 'my-profile-profile',
          name: 'my-profile-profile',
          components: {
            main: () => import('@/components/MyProfileProfile.vue'),
          },
        },
        {
          path: 'my-profile-settings',
          name: 'my-profile-settings',
          components: {
            main: () => import('@/components/MyProfileSettings.vue'),
          },
        },
        {
          path: 'my-profile-chats',
          name: 'my-profile-chats',
          components: {
            main: () => import('@/components/MyProfileChats.vue'),
          },
        },
        {
          path: 'my-profile-ratings',
          name: 'my-profile-ratings',
          components: {
            main: () => import('@/components/MyProfileRatings.vue'),
          },
        },
      ],
    },
    {
      path: '/ad/:id',
      name: 'AdDetail',
      component: () => import('@/components/DynamicAd.vue'),
      props: true,
    },
    {
      path: '/chats/:id',
      name: 'Check',
      component: () => import('@/components/ExtendedChatMessageComponent.vue'),
      props: true,
    },
    {
      path: '/user-profile/:id',
      name: 'UserProfile',
      component: () => import('@/components/user-profile/UserProfile.vue'),
      props: true,
    },
  ],
})

export default router
