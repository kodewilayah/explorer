import { createApp } from 'vue'
import App from './App.vue'
import Home from './pages/Home.vue'

import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/:code',
      name: 'browse',
      component: () => import('./pages/Browse.vue'),
      props: true
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('./pages/Search.vue'),
      props: true
    }
  ]
});

declare global {
  interface Window { goatcounter?: any }
}
router.afterEach(({ fullPath }) => {
  if ('goatcounter' in window)
    window.goatcounter.count({ path: fullPath })
});

createApp(App).use(router).use(createPinia()).mount('#app')
