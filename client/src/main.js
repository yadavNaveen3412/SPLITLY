import { createApp } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import apolloClient from "./apollo";
import App from "./App.vue";
import router from "./router/routes";
import store from "./store";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/js/all.min.js";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import vue3GoogleLogin from "vue3-google-login";

const app = createApp(App);
app.use(vue3GoogleLogin, {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
});

app.provide(DefaultApolloClient, apolloClient).use(store).use(router);

app.mount("#app");
