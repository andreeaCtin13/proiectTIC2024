<template>
  <div class="administrator">
    <h1 class="titleH1">Administrator Homepage</h1>
    <button class="btn btnImportSectii" @click="uploadSections">
      <i class="fas fa-file-import"></i> Import sectii votare
    </button>
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileUpload"
    />
    <br />
    <br />
    <h2>Gestioneaza alegerile din tara!</h2>

    <div class="elections">
      <h3>Alegeri</h3>
      <button class="btn btnElections" @click="dialog = true">
        <i class="fas fa-plus-circle"></i> Adauga o noua alegere
      </button>

      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">Adauga o alegere</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="formValid">
              <v-text-field
                v-model="newElection.name"
                label="Nume"
                required
              ></v-text-field>
              <v-text-field
                v-model="newElection.observingStartDate"
                label="Data de start (YYYY-MM-DD)"
                required
              ></v-text-field>
              <v-text-field
                v-model="newElection.observingEndDate"
                label="Data de sfarsit (YYYY-MM-DD)"
                required
              ></v-text-field>
              <v-switch
                v-model="newElection.isValid"
                label="Este valida"
              ></v-switch>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <button
              class="btn btnElections"
              :disabled="!formValid"
              @click="submitElection"
            >
              <i class="fas fa-save"></i> Salveaza
            </button>
            <button class="btn btnElections badBtn" @click="dialog = false">
              <i class="fas fa-times"></i> Inchide
            </button>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="editDialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">Editeaza alegerea</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="editForm" v-model="editFormValid">
              <v-text-field
                v-model="currentElection.name"
                label="Nume"
                required
              ></v-text-field>
              <v-text-field
                v-model="currentElection.observingStartDate"
                label="Data de start (YYYY-MM-DD)"
                required
              ></v-text-field>
              <v-text-field
                v-model="currentElection.observingEndDate"
                label="Data de sfarsit (YYYY-MM-DD)"
                required
              ></v-text-field>
              <v-switch
                v-model="currentElection.isValid"
                label="Este valida"
              ></v-switch>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <button
              class="btn btnElections"
              :disabled="!editFormValid"
              @click="submitEditedElection"
            >
              <i class="fas fa-save"></i> Salveaza modificarile
            </button>
            <button class="btn btnElections badBtn" @click="editDialog = false">
              <i class="fas fa-times"></i> Inchide
            </button>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div v-if="elections.length" class="containerElections">
        <div
          v-for="election in elections"
          :key="election.id"
          class="election-card"
        >
          <h4>{{ election.name }}</h4>
          <p>Start Observare: {{ election.observingStartDate }}</p>
          <p>End Observare: {{ election.observingEndDate }}</p>
          <p>Valid: {{ election.isValid ? "Da" : "Nu" }}</p>
          <button class="btn btnElections" @click="openEditDialog(election)">
            <i class="fas fa-edit"></i> Editeaza
          </button>
          <button
            class="btn btnElections badBtn"
            @click="deleteElection(election.id)"
          >
            <i class="fas fa-trash-alt"></i> Sterge
          </button>
        </div>
      </div>
      <div v-else>
        <p>Nu exista alegeri inregistrate.</p>
      </div>
    </div>

    <v-snackbar v-model="snackbar" :color="snackbarColor" top>
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from "../../axios";

export default {
  data() {
    return {
      user: "Administrator",
      selectedFile: null,
      elections: [],
      dialog: false, // Modal pentru adăugare
      editDialog: false, // Modal pentru editare
      formValid: false,
      editFormValid: false,
      newElection: {
        name: "",
        observingStartDate: "",
        observingEndDate: "",
        isValid: false,
      },
      currentElection: {
        id: null,
        name: "",
        observingStartDate: "",
        observingEndDate: "",
        isValid: false,
      },
      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "success",
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadSections() {
      this.$refs.fileInput.click();
    },
    async fetchElections() {
      try {
        const response = await axios.get("/elections");
        this.elections = response.data;
      } catch (error) {
        this.showToast("Nu s-au putut incarca alegerile.", "error");
      }
    },
    async submitElection() {
      try {
        const response = await axios.post("/elections", this.newElection);
        this.elections.push(response.data);
        this.dialog = false;
        this.resetNewElection();
        this.showToast("Alegerea a fost adaugata cu succes!", "success");
      } catch (error) {
        this.showToast("Nu s-a putut adauga alegerea.", "error");
      }
    },
    async deleteElection(id) {
      if (!confirm("Sigur doriti sa stergeti aceasta alegere?")) return;

      try {
        await axios.delete(`/elections/${id}`);
        this.elections = this.elections.filter(
          (election) => election.id !== id
        );
        this.showToast("Alegerea a fost stearsa cu succes!", "success");
      } catch (error) {
        this.showToast("Nu s-a putut sterge alegerea.", "error");
      }
    },
    openEditDialog(election) {
      this.currentElection = { ...election };
      this.editDialog = true;
    },
    async submitEditedElection() {
      try {
        const response = await axios.put(
          `/elections/${this.currentElection.id}`,
          this.currentElection
        );
        this.elections = this.elections.map((e) =>
          e.id === this.currentElection.id ? response.data : e
        );
        this.editDialog = false;
        this.showToast("Alegerea a fost editata cu succes!", "success");
      } catch (error) {
        this.showToast("Nu s-a putut edita alegerea.", "error");
      }
    },
    resetNewElection() {
      this.newElection = {
        name: "",
        observingStartDate: "",
        observingEndDate: "",
        isValid: false,
      };
    },
    showToast(message, color) {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
  mounted() {
    this.fetchElections();
  },
};
</script>

<style scoped>
.administrator {
  margin: 2rem;
}

.titleH1 {
  padding: 2rem 0;
}

.btn {
  height: 3rem;
  width: fit-content;
  border-radius: 3rem;
  font-size: 1.3rem;
  transition: 0.3s;
  padding: 0 0.5rem;
  border: 3px solid var(--var--medium-blue);
}

.btn:hover {
  font-size: 1.4rem;
  transition: 0.3s;
}

.btnImportSectii {
  background-color: var(--var--dark-blue);
  color: white;
}

.containerElections {
  display: flex;
  margin: 2rem 0;
  gap: 1rem;
}

.elections {
  margin-top: 2rem;
}

.election-card {
  border: 1px solid #ccc;
  background-color: var(--var--light-white);
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 5px;
}

.election-card h4 {
  margin: 0 0 0.5rem 0;
}

.election-card button {
  margin-right: 0.5rem;
}

.btnElections {
  font-size: 1rem;
  padding: 0 1rem;
}

.btnElections:hover {
  width: fit-content;
  font-size: 1.1rem;
}

.badBtn {
  border: none;
  background-color: var(--var--close-red);
  color: var(--var--light-white);
}

@media screen and (max-width: 900px) {
  .containerElections {
    flex-direction: column;
  }
}
</style>
