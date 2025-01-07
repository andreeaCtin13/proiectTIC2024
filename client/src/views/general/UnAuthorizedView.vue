<template>
  <div class="unauthorized-view">
    <div class="joke-container">
      <h1 class="oops-text">Oops! You&#39;re Unauthorized!</h1>
      <p class="joke-text">
        Why did the unauthorized user cross the road? <br />
        Because they couldn&#39;t access the chicken!
      </p>
      <button @click="goBack" class="back-button">Take me back</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "UnauthorizedView",
  methods: {
    goBack() {
      if (this.$router.options.history.state.back === "/unauthorized") {
        this.$router.push("/administrator");
      } else {
        this.$router.push("/");
      }
    },
  },
};
</script>

<style scoped>
.unauthorized-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--var--light-blue);
}

.joke-container {
  text-align: center;
  background-color: var(--var--dark-whitebluish);
  border: 2px solid var(--var--medium-blue);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

.oops-text {
  font-size: 2rem;
  color: var(--var--close-red);
  margin-bottom: 1rem;
}

.joke-text {
  font-size: 1.2rem;
  color: var(--var--light-black);
  margin-bottom: 1.5rem;
}

.back-button {
  background-color: var(--var--medium-blue);
  color: var(--var--light-white);
  border: none;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: var(--var--dark-blue);
}
</style>
