<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>Application Bar</v-app-bar-title>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/register" v-if="!user">Register</router-link>
    <router-link to="/login" v-if="!user">Login</router-link>
    <router-link to="/admin-home" v-if="user && user.role === 'admin'"
      >Administrator Homepage</router-link
    >
  </v-app-bar>
</template>

<script>
import { inject } from "vue";

export default {
  name: "Navigation",
  setup() {
    const user = inject("user"); // Accesăm 'user' oferit de App.vue
    return { user };
  },
};
</script>
