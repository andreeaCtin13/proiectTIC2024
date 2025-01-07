import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/general/RegisterView.vue";
import LoginView from "../views/general/LoginView.vue";
import AdministratorHomepage from "../views/admin/AdministratorHomeView.vue";
import ObserverHomepage from "../views/observer/ObserverHomeView.vue";
import Search from "../views/observer/Search.vue";
import Status from "../views/observer/Status.vue";
import StatisticsView from "../views/admin/StatisticsView.vue";
import UnAuthorized from "../views/general/UnAuthorizedView.vue";
const routes = [
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  {
    path: "/admin-homepage",
    name: "admin-homepage",
    component: AdministratorHomepage,
  },
  {
    path: "/observer-homepage",
    name: "observer-homepage",
    component: ObserverHomepage,
  },
  {
    path: "/search",
    name: "search",
    component: Search,
  },
  {
    path: "/current-status",
    name: "current-status",
    component: Status,
  },
  {
    path: "/stats",
    name: "statistics",
    component: StatisticsView,
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: UnAuthorized,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
