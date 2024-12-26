<template>
  <v-app class="app full-space">
    <v-main>
      <navigation v-if="isLoggedIn" />
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

    provide("user", user);
    console.log("User provided in App.vue:", user);

    const isLoggedIn = computed(
      () =>
        user.value !== null &&
        Object.keys(user.value).length > 0 &&
        user.value.role !== null
    );

    return {
      user,
      isLoggedIn,
    };
  },
};
</script>

<style scoped>
.full-space {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
