/**
 * Main Entry Point
 * Initializes Vue, Pinia, and Router
 */

import { createApp } from "vue";
import { createPinia } from "pinia";
import persistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Setup Pinia with persistence
const pinia = createPinia();
pinia.use(persistedstate);

app.use(pinia);
app.use(router);

app.mount("#app");
