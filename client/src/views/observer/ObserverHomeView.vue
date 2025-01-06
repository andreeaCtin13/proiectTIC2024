<template>
  <div class="observer">
    <h1>Observer Homepage</h1>
    <div>Email: {{ user?.email }}</div>

    <h2>Please select the elections you want to observe:</h2>

    <div v-for="election in validElections" :key="election.id">
      <label>
        <input
          type="checkbox"
          :value="election.id"
          v-model="selectedElections"
        />
        {{ election.name }}
      </label>
    </div>

    <button @click="saveSelections">Save</button>
  </div>
</template>

<script>
import { inject, ref, onMounted } from "vue";
import axios from "../../axios";

export default {
  name: "ObserverHomepage",
  setup() {
    const user = inject("user");
    const validElections = ref([]);
    const selectedElections = ref([]);

    const getValidElections = async () => {
      try {
        const response = await axios.get("/validElections");
        validElections.value = response.data.filter(
          (election) => election.isValid
        );
      } catch (error) {
        console.error("Error fetching elections:", error);
      }
    };

    onMounted(() => {
      getValidElections();
    });

    const saveSelections = async () => {
      if (!user.value || !user.value.id) {
        console.error("User ID is not available.");
        return;
      }

      try {
        const response = await axios.put("/saveElections", {
          userId: user.value.id,
          elections: selectedElections.value,
        });
        console.log("Selections saved:", response.data);
      } catch (error) {
        console.error("Error saving selections:", error);
      }
    };

    return {
      user,
      validElections,
      selectedElections,
      saveSelections,
    };
  },
};
</script>

<style scoped>
.observer {
  padding: 4rem;
}

button {
  padding: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
