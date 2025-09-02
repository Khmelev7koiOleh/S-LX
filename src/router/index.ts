import { createRouter, createWebHistory } from 'vue-router'

// Optional: keep home static if it's lightweight and critical
import HomeView from '../views/HomeView.vue'

// Helper for lazy imports
const lazy = (path: string) => () => import(path)

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
      component: lazy('../views/LoginView.vue'),
    },
    {
      path: '/chats',
      name: 'chats',
      component: lazy('../views/ChatsView.vue'),
    },
    {
      path: '/ads',
      name: 'ads',
      component: lazy('../views/AllAdsView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: lazy('../views/FavoritesView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: lazy('../views/ProfileView.vue'),
      children: [
        {
          path: 'my-profile-ads',
          name: 'my-profile-ads',
          components: {
            main: lazy('../components/MyAdsProfile.vue'),
          },
        },
        {
          path: 'my-profile-profile',
          name: 'my-profile-profile',
          components: {
            main: lazy('../components/MyProfileProfile.vue'),
          },
        },
        {
          path: 'my-profile-settings',
          name: 'my-profile-settings',
          components: {
            main: lazy('../components/MyProfileSettings.vue'),
          },
        },
        {
          path: 'my-profile-chats',
          name: 'my-profile-chats',
          components: {
            main: lazy('../components/MyProfileChats.vue'),
          },
        },
        {
          path: 'my-profile-ratings',
          name: 'my-profile-ratings',
          components: {
            main: lazy('../components/MyProfileRatings.vue'),
          },
        },
      ],
    },
    {
      path: '/ad/:id',
      name: 'AdDetail',
      component: lazy('../components/DynamicAd.vue'),
      props: true,
    },
    {
      path: '/chats/:id',
      name: 'Check',
      component: lazy('../components/ExtendedChatMessageComponent.vue'),
      props: true,
    },
    {
      path: '/user-profile/:id',
      name: 'UserProfile',
      component: lazy('../components/user-profile/UserProfile.vue'),
      props: true,
    },
  ],
})

export default router
