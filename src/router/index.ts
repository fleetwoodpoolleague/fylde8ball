import HomePage from '../pages/HomePage.vue'
import TournamentsPage from '../pages/TournamentsPage.vue'
import TournamentDetailPage from '../pages/TournamentDetailPage.vue'
import LeaguesPage from '../pages/LeaguesPage.vue'
import AboutPage from '../pages/AboutPage.vue'

export const routes = [
  { path: '/', component: HomePage },
  { path: '/tournaments', component: TournamentsPage },
  {
    path: '/tournaments/:slug',
    component: TournamentDetailPage,
    props: true,
  },
  { path: '/leagues', component: LeaguesPage },
  { path: '/about', component: AboutPage },
]
