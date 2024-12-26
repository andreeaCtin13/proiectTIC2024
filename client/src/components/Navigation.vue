<template>
  <v-app-bar :elevation="2" class="navbar">
    <v-app-bar-title>
      <h1 class="titleNav">ObservErr<span class="spanNav">(ors)</span></h1>
    </v-app-bar-title>
    <div class="links-container">
      <router-link to="/search" class="nav-link"
        >Search for a section</router-link
      >
      |
      <router-link to="/current-status" class="nav-link"
        >Current status</router-link
      >
      |
      <router-link
        to="/admin-homepage"
        v-if="user && user.role === 'admin'"
        class="nav-link"
        >Administrator Homepage</router-link
      >
      <router-link
        to="/observer-homepage"
        v-if="user && user.role === 'observer'"
        class="nav-link"
        >Observer Homepage</router-link
      >
    </div>
  </v-app-bar>
</template>

<script>
import { inject } from "vue";

export default {
  name: "Navigation",
  setup() {
    const user = inject("user");
    return { user };
  },
};
</script>

<style>
.titleNav {
  color: var(--var--light-black);
  font-size: 2rem;
}

.spanNav {
  font-size: 1rem;
}

.navbar {
  height: 6rem;
  display: flex !important;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.links-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  font-size: 1.2rem;
  color: var(--var--light-black);
  font-weight: 500;
  transition: color 0.3s, transform 0.3s;
}

.nav-link:hover {
  color: var(--var--dark-blue);
  transform: scale(1.1);
}

.nav-link:active {
  color: var(--var--dark-blue);
}

.nav-link + .nav-link {
  margin-left: 1rem;
}
</style>
