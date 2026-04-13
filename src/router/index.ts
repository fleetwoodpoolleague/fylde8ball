import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import TournamentsPage from '../pages/TournamentsPage.vue'
import TournamentDetailPage from '../pages/TournamentDetailPage.vue'
import LeaguesPage from '../pages/LeaguesPage.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', component: HomePage },
    { path: '/tournaments', component: TournamentsPage },
    {
      path: '/tournaments/:slug',
      component: TournamentDetailPage,
      props: true,
    },
    { path: '/leagues', component: LeaguesPage },
  ],
})

export default router
