<template>
  <v-app class="app full-space">
    <v-main>
      <navigation v-if="isLoggedIn" @logout="logout" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { ref, provide, computed } from "vue";
import Navigation from "./components/Navigation.vue";

export default {
  name: "App",
  components: {
    Navigation,
  },
  setup() {
    const user = ref({ role: null });

    // Reîncarcă datele utilizatorului la inițializare
    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }

    provide("user", user);

    const isLoggedIn = computed(
      () =>
        user.value !== null &&
        Object.keys(user.value).length > 0 &&
        user.value.role !== null
    );

    const logout = () => {
      user.value = { role: null };
      localStorage.removeItem("user_data"); // Șterge datele utilizatorului
    };

    return {
      user,
      isLoggedIn,
      logout,
    };
  },
};
</script>
