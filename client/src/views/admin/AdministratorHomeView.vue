<template>
  <div class="administrator">
    <div class="flexAdmin">
      <div class="containerAdmin">
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
        <v-container class="mt-5 containerMail">
          <h3>Send an email to all of the observers</h3>
          <v-form ref="messageForm" v-model="formValid">
            <v-textarea
              v-model="message"
              class="textAreaMail"
              label="The message you want to be sent"
              outlined
              rows="5"
              required
            ></v-textarea>
            <button
              class="btn btnElections"
              :disabled="!formValid"
              @click="sendMessage"
            >
              Send the message
            </button>
          </v-form>
        </v-container>
      </div>

      <div class="elections">
        <h2>Organize the elections in your country!</h2>
        <br />
        <h3>The elections registered in the app</h3>
        <br />
        <button class="btn btnElections" @click="dialog = true">
          <i class="fas fa-plus-circle"></i> Add a new election
        </button>

        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Add an election</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="formValid">
                <v-text-field
                  v-model="newElection.name"
                  label="Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newElection.observingStartDate"
                  label="Start Date (YYYY-MM-DD)"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newElection.observingEndDate"
                  label="End Date (YYYY-MM-DD)"
                  required
                ></v-text-field>
                <v-switch
                  v-model="newElection.isValid"
                  label="Is it valid?"
                ></v-switch>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <button
                class="btn btnElections"
                :disabled="!formValid"
                @click="submitElection"
              >
                <i class="fas fa-save"></i> Save
              </button>
              <button class="btn btnElections badBtn" @click="dialog = false">
                <i class="fas fa-times"></i> Close
              </button>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="editDialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Edit the election</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="editForm" v-model="editFormValid">
                <v-text-field
                  v-model="currentElection.name"
                  label="Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="currentElection.observingStartDate"
                  label="Start Date (YYYY-MM-DD)"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="currentElection.observingEndDate"
                  label="End Date (YYYY-MM-DD)"
                  required
                ></v-text-field>
                <v-switch
                  v-model="currentElection.isValid"
                  label="Is it valid?"
                ></v-switch>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <button
                class="btn btnElections"
                :disabled="!editFormValid"
                @click="submitEditedElection"
              >
                <i class="fas fa-save"></i> Save the changes
              </button>
              <button
                class="btn btnElections badBtn"
                @click="editDialog = false"
              >
                <i class="fas fa-times"></i> Close
              </button>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Confirm Delete</span>
            </v-card-title>
            <v-card-text>
              Are you sure you want to delete the election:
              <strong>{{ deleteElectionName }}</strong
              >?
            </v-card-text>
            <v-card-actions>
              <button class="btn btnElections badBtn" @click="confirmDelete">
                <i class="fas fa-trash-alt"></i> Yes, Delete
              </button>
              <button class="btn btnElections" @click="cancelDelete">
                <i class="fas fa-times"></i> Cancel
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
            <p>Start Observing: {{ election.observingStartDate }}</p>
            <p>End Observing: {{ election.observingEndDate }}</p>
            <p>Valid: {{ election.isValid ? "Yes" : "No" }}</p>
            <div class="buttonsSection">
              <button
                class="btn btnElections"
                @click="openEditDialog(election)"
              >
                <i class="fas fa-edit"></i> Edit
              </button>
              <button
                class="btn btnElections badBtn"
                @click="openDeleteDialog(election)"
              >
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>There is no registered election.</p>
        </div>
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
      dialog: false,
      editDialog: false,
      formValid: false,
      editFormValid: false,
      message: "",
      deleteDialog: false,
      deleteElectionId: null,
      deleteElectionName: "",
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
    async parseExcelFile(file) {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            resolve(rows);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    },
    async submitFile() {
      if (!this.selectedFile) {
        alert("Please select a file first.");
        return;
      }
      const formData = new FormData();
      formData.append("file", this.selectedFile);
      try {
        const response = await axios.post(
          "http://localhost:3000/upload-sections",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert(`Upload successful: ${response.data.count} sections imported.`);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload sections.");
      }
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
    async sendMessage() {
      try {
        await axios.post("/sendMail", { message: this.message });
        this.snackbarMessage = "Mesajul a fost trimis cu succes!";
        this.snackbarColor = "success";
        this.message = "";
      } catch (error) {
        this.snackbarMessage = "Eroare la trimiterea mesajului.";
        this.snackbarColor = "error";
      } finally {
        this.snackbar = true;
      }
    },
    openDeleteDialog(election) {
      this.deleteElectionId = election.id;
      this.deleteElectionName = election.name;
      this.deleteDialog = true;
    },
    cancelDelete() {
      this.deleteDialog = false;
      this.deleteElectionId = null;
      this.deleteElectionName = "";
    },
    async confirmDelete() {
      try {
        await axios.delete(`/elections/${this.deleteElectionId}`);
        this.elections = this.elections.filter(
          (election) => election.id !== this.deleteElectionId
        );
        this.showToast("Election deleted successfully!", "success");
      } catch (error) {
        this.showToast("Failed to delete election.", "error");
      } finally {
        this.deleteDialog = false;
      }
    },
  },
  mounted() {
    this.fetchElections();
  },
  watch: {
    selectedFile() {
      this.submitFile();
    },
  },
};
</script>

<style scoped>
.administrator {
  margin: 4rem;
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
  font-size: 1rem;
}

.containerElections {
  display: flex;
  flex-wrap: wrap;
  margin: 2rem 0;
  gap: 10px;
}

.v-input__detail {
  display: none;
}

.elections {
  margin-top: 2rem;
}

.election-card {
  border: 1px solid #ccc;
  flex: 1 1 calc(30% - 10px);
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

.flexAdmin {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 2rem;
  justify-content: space-around;
}

.buttonsSection {
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 1rem 0 0 0;
}

@media screen and(max-width:1000px) {
  .btnImportSectii {
    font-size: 1rem;
  }
}

@media screen and (max-width: 900px) {
  .containerElections {
    flex-direction: column;
  }

  .flexAdmin {
    flex-direction: column;
    gap: 0;
  }
  .election-card {
    padding: 1rem;
  }
  .administrator {
    margin: 2rem;
    text-align: center;
  }
  .v-main {
    padding: 0;
  }
  .titleH1 {
    padding: 0;
  }
}
</style>
