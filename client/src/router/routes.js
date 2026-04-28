import { createWebHistory, createRouter } from "vue-router";
import store from "@/store";
import MainLayoutRoutes from "@/router/mainLayout.routes";

const RegisterPage = () => import("../views/Register/RegisterPage.vue");
const LandingPage = () => import("../views/Landing/LandingPage.vue");

const routes = [
  {
    name: "Register",
    path: "/register",
    component: RegisterPage,
    meta: { public: true },
  },
  {
    name: "Landing",
    path: "/",
    component: LandingPage,
    meta: { public: true },
  },
  MainLayoutRoutes,
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, from, next) => {
  const auth = store.state.auth;

  if (!auth.checked) {
    await store.dispatch("auth/fetchUser");
  }

  const isPublic = to.meta.public;

  if (!auth.user && !isPublic) {
    return next({ name: "Register" });
  }

  if (auth.user && isPublic) {
    return next({ name: "Home" });
  }

  next();
});

export default router;
