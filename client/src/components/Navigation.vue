<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/register">Register</router-link>
    </v-app-bar-title>
  </v-app-bar>
</template>

<script>
export default { name: "Navigation" };
</script>
