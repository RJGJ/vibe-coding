/**
 * Vue Router Configuration
 * Routes for the application
 */

import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./stores/userStore";

const routes = [
  {
    path: "/",
    name: "login",
    component: () => import("./components/Login.vue"),
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("./components/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/room/:id",
    name: "room",
    component: () => import("./components/VideoGrid.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
