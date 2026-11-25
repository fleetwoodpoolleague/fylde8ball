import HomePage from '../pages/HomePage.vue'
import TournamentsPage from '../pages/TournamentsPage.vue'
import TournamentDetailPage from '../pages/TournamentDetailPage.vue'
import VenuesPage from '../pages/VenuesPage.vue'
import VenueDetailPage from '../pages/VenueDetailPage.vue'
import LeaguesPage from '../pages/LeaguesPage.vue'
import AboutPage from '../pages/AboutPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

export const routes = [
  { path: '/', component: HomePage },
  { path: '/tournaments', component: TournamentsPage },
  {
    path: '/tournaments/:slug',
    component: TournamentDetailPage,
    props: true,
  },
  { path: '/venues', component: VenuesPage },
  {
    path: '/venues/:slug',
    component: VenueDetailPage,
    props: true,
  },
  { path: '/leagues', component: LeaguesPage },
  { path: '/about', component: AboutPage },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
]
