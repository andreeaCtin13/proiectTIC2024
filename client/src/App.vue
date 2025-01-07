<template>
  <v-app class="app full-space">
    <v-main>
      <navigation v-if="isLoggedIn" @logout="logout" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { ref, provide, computed, onMounted } from "vue";
import Navigation from "./components/Navigation.vue";

export default {
  name: "App",
  components: {
    Navigation,
  },
  setup() {
    const user = ref({ role: null });

    const checkAuth = () => {
      const token = sessionStorage.getItem("auth_token");
      console.log("Token found:", token);

      if (token) {
        user.value = { role: "observer" };
      } else {
        user.value = { role: null };
      }

      console.log("User after checkAuth:", user.value);
    };

    onMounted(() => {
      checkAuth();
    });

    const isLoggedIn = computed(
      () =>
        user.value !== null &&
        Object.keys(user.value).length > 0 &&
        user.value.role !== null
    );

    const logout = () => {
      user.value = { role: null };
      console.log("User logged out:", user.value);
    };

    provide("user", user);

    return {
      user,
      isLoggedIn,
      logout,
    };
  },
};
</script>
