<template>
  <div class="observer">
    <h1>Observer Homepage</h1>
    <div>Email: {{ user?.email }}</div>

    <h2>Please select the elections you want to observe:</h2>

    <div v-for="election in validElections" :key="election.id">
      <label class="label">
        <input
          class="inputCheck"
          type="checkbox"
          :value="election.id"
          v-model="selectedElections"
        />
        {{ election.name }}
      </label>
    </div>

    <button @click="saveSelections">{{ btnValue }}</button>
  </div>
</template>

<script>
import { inject, ref, onMounted } from "vue";
import axios from "../../axios";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

export default {
  name: "ObserverHomepage",
  setup() {
    const user = inject("user");
    const validElections = ref([]);
    const selectedElections = ref([]);
    let btnValue = ref("terog");
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

    const getUserSelections = async () => {
      if (!user.value || !user.value.id) {
        console.error("User ID is not available.");
        return;
      }

      try {
        const response = await axios.get(`/userSelections/${user.value.id}`);
        if (response.data.electionsAssociated) {
          btnValue.value = "Modify";
        } else {
          btnValue.value = "Save";
        }
        selectedElections.value = response.data.electionsAssociated || [];
      } catch (error) {
        console.error("Error fetching user selections:", error);
      }
    };

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
        toastr.success("Changes saved!", "Success");
      } catch (error) {
        toastr.error("Failed!", "Problems saving changes");
        console.error("Error saving selections:", error);
      }
    };

    onMounted(async () => {
      await getValidElections();
      await getUserSelections();
    });

    return {
      user,
      validElections,
      selectedElections,
      saveSelections,
      btnValue,
    };
  },
};
</script>

<style scoped>
.observer {
  padding: 4rem;
}

.label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button {
  padding: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.inputCheck {
  width: 1.2rem;
  height: 1.2rem;
}
</style>
