import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/accueil',
    },
    {
      path: '/accueil',
      name: 'Home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/galerie',
      name: 'Gallery',
      component: () => import('../pages/GalleryPage.vue'),
    },
    {
      path: '/mentions-legales',
      name: 'Legal',
      component: () => import('../pages/LegalPage.vue'),
    },
    {
      path: '/admin',
      name: 'Dashboard',
      component: () => import('../pages/admin/DashboardPage.vue'),
    },
    {
      path: '/admin/upload',
      name: 'Upload',
      component: () => import('../pages/admin/UploadPage.vue'),
    },
    {
      path: '/contact',
      beforeEnter: () => {
        window.location.href = 'https://contact.brendanfleurdelys.ch/index.php?origin=photo'
        return false
      },
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
})

export default router
