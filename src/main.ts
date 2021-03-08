import { createApp } from 'vue'
import App from './App.vue'
import Home from './pages/Home.vue'
import './index.css'

import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Home
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
router.afterEach((path) => {
  if ('goatcounter' in window)
    window.goatcounter.count({ path })
});

createApp(App).use(router).mount('#app')
