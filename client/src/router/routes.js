import { createWebHistory, createRouter } from "vue-router";
import store from "@/store";
import MainLayoutRoutes from "@/router/mainLayout.routes";

const RegisterPage = () => import("../views/Register/RegisterPage.vue");
const LandingPage = () => import("../views/Landing/LandingPage.vue");
const NotFound = () => import("../views/NotFound/NotFound.vue");

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
  {
    name: "NotFound",
    path: "/:pathMatch(.*)*",
    component: NotFound,
    meta: { public: true },
  },
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
    // Allow navigation to 404 page even if authenticated
    if (to.name === "NotFound") {
      return next();
    }
    return next({ name: "Home" });
  }

  next();
});

export default router;
