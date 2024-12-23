import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import AdministratorHomepage from "../views/AdministratorHomeView.vue";
import ObserverHomepage from "../views/ObserverHomeView.vue";
import Search from "../views/Search.vue";
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
