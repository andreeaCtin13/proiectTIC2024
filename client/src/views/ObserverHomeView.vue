<template>
  <div class="observer">
    <h1>Observer Homepage</h1>
    <div>Email: {{ user?.email }}</div>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  name: "ObserverHomepage",
  setup() {
    const user = inject("user");

    return {
      user,
    };
  },
};
</script>

<style scoped>
.observer {
  padding: 20px;
}
</style>
