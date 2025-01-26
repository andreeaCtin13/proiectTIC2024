<template>
  <div class="observer">
    <h1>Observer Homepage</h1>
    <div>Email: {{ user?.email }}</div>

    <h2 v-if="isEditing" class="p1top">
      Please select the elections you want to observe:
    </h2>
    <h2 v-if="!isEditing" class="p1top">The elections you selected:</h2>
    <div v-if="isEditing">
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
    </div>
    <div v-else class="ol">
      <p v-if="selectedElections.length === 0">No elections selected.</p>
      <ol v-else>
        <li v-for="electionId in selectedElections" :key="electionId">
          {{ getElectionName(electionId) }}
        </li>
      </ol>
    </div>

    <button class="p1top btnToggle" @click="toggleEditMode">
      {{ btnValue }}
    </button>
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
    const isEditing = ref(false);
    const btnValue = ref("Modify");

    const getValidElections = async () => {
      try {
        const response = await axios.get("/getValidElectionsToSignUp");
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
        if (selectedElections.value.length === 0) {
          toastr.warning("Please select at least one election.", "Warning");
          return;
        }

        const response = await axios.put("/saveElections", {
          userId: user.value.id,
          elections: selectedElections.value,
        });
        console.log("Selections saved:", response.data);
        toastr.success("Changes saved!", "Success");

        isEditing.value = false;
        btnValue.value = "Modify";
      } catch (error) {
        toastr.error("Failed!", "Problems saving changes");
        console.error("Error saving selections:", error);
      }
    };

    const toggleEditMode = () => {
      if (isEditing.value) {
        saveSelections();
      } else {
        isEditing.value = true;
        btnValue.value = "Save";
      }
    };

    const getElectionName = (id) => {
      const election = validElections.value.find((e) => e.id === id);
      return election ? election.name : "Unknown election";
    };

    onMounted(async () => {
      await getValidElections();
      await getUserSelections();
    });

    return {
      user,
      validElections,
      selectedElections,
      isEditing,
      btnValue,
      toggleEditMode,
      getElectionName,
    };
  },
};
</script>

<style scoped>
.observer {
  padding: 3rem;
}

.p1top {
  padding: 1rem 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btnToggle {
  padding: 1rem;
  margin: 1rem 0;
  background-color: var(--var--dark-blue);
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.ol {
  padding: 1.2rem;
}

.btnToggle:hover {
  transition: 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.inputCheck {
  width: 1.2rem;
  height: 1.2rem;
}
@media screen and(max-width:900px) {
  .observer {
    padding: 2rem;
  }
}
</style>
