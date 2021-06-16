import { createApp } from 'vue'
import App from './App.vue'
import Home from './pages/Home.vue'

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
      props: {
        heroContent: document.getElementById('app')?.innerHTML
      }
    },
    {
      path: '/:code',
      component: () => import('./pages/Browse.vue'),
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

createApp(App).use(router).mount('#app')
