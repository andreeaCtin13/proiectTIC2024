import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import AdministratorHomepage from "../views/AdministratorHomeView.vue";
import ObserverHomepage from "../views/ObserverHomeView.vue";

const routes = [
  {
    path: "/admin-homepage",
    name: "admin-homepage",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: AdministratorHomepage,
  },
  {
    path: "/observer-homepage",
    name: "observer-homepage",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: ObserverHomepage,
  },
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
