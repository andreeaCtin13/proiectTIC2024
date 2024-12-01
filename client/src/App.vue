<template>
  <v-app>
    <v-main>
      <Navigation />

      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Navigation from "./components/Navigation.vue";
export default {
  components: { Navigation },
  name: "App",

  data: () => ({
    //
  }),
};
</script>
