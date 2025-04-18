import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../views/MainPage.vue';
import FormPage from '../views/FormPage.vue';

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainPage,
  },
  {
    path: '/form',
    name: 'Form',
    component: FormPage,
  },
];

const router = createRouter({
  history: createWebHistory('/gender-reveal/'), 
  routes,
});

export default router;