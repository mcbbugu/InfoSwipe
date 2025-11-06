import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import SwipeView from './views/SwipeView.vue'
import ReviewView from './views/ReviewView.vue'

const routes = [
  { path: '/', component: SwipeView },
  { path: '/review', component: ReviewView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
