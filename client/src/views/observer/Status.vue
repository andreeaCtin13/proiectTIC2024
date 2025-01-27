<template>
  <div class="status">
    <!-- Secțiunea deja existentă -->
    <h1>Current status</h1>
    <div v-if="isObserving()">
      <h3>Congratulations! You are doing your duty as a voting observer</h3>
      <div>Here are the details about the section you observe.</div>
      <strong>
        <div class="subtitle">
          Sectia de votare nr.{{ user?.sectionObserved?.number }}
        </div>
      </strong>

      <div class="infoText">
        <div class="upsideText">Location</div>
        {{ user?.sectionObserved?.location }}
      </div>
      <div class="infoText">
        <div class="upsideText">County</div>
        {{ user?.sectionObserved?.county }}
      </div>
      <div class="infoText">
        <div class="upsideText">Address</div>
        {{ user?.sectionObserved?.address }}
      </div>
    </div>
    <div v-else>
      <p>
        You have to search for a section first. Go to
        <router-link to="/search" class="redirect-link">Search</router-link> the
        page.
      </p>
    </div>

    <div v-if="isObserving()" class="justice-form">
      <h3>Were there any injustices at the voting section?</h3>
      <div>
        <label>
          <input
            type="radio"
            name="injustice"
            value="no"
            v-model="injusticeReported"
            @change="handleInjusticeChange"
          />
          No
        </label>
        <label>
          <input
            type="radio"
            name="injustice"
            value="yes"
            v-model="injusticeReported"
            @change="handleInjusticeChange"
          />
          Yes
        </label>
      </div>
      <div v-if="injusticeReported === 'yes'" class="file-upload">
        <label for="report-file">Upload your report (PDF only):</label>
        <input
          type="file"
          id="report-file"
          @change="handleFileChange"
          accept=".pdf"
        />
        <p v-if="fileError" class="error-message">{{ fileError }}</p>
      </div>
    </div>

    <div v-if="isObserving()" class="container-release-button">
      <button
        class="release-button"
        :disabled="releaseDisabled"
        @click="openConfirmationDialog"
      >
        Release section
      </button>
    </div>

    <!-- Dialog de confirmare și Snackbar -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-text>
          Do you really want to release the observed section? This action cannot
          be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">No</v-btn>
          <v-btn color="red darken-1" text @click="confirmRelease">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      :timeout="3000"
      top
      right
    >
      {{ toast.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { inject } from "vue";
import axios from "../../axios";

export default {
  name: "ObserverHomepage",
  data() {
    return {
      dialog: false,
      toast: {
        show: false,
        message: "",
        color: "",
      },
      injusticeReported: null,
      selectedFile: null,
      fileError: "",
    };
  },
  setup() {
    const user = inject("user");
    return {
      user,
    };
  },
  computed: {
    releaseDisabled() {
      return (
        !this.injusticeReported ||
        (this.injusticeReported === "yes" && !this.selectedFile)
      );
    },
  },
  methods: {
    isObserving() {
      return this.user && this.user.observe;
    },
    handleInjusticeChange() {
      if (this.injusticeReported === "no") {
        this.selectedFile = null;
        this.fileError = "";
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && file.type !== "application/pdf") {
        this.fileError = "Only PDF files are allowed.";
        this.selectedFile = null;
      } else {
        this.fileError = "";
        this.selectedFile = file;
      }
    },
    async openConfirmationDialog() {
      if (this.releaseDisabled) {
        this.showToast(
          "Please ensure you've selected Yes/No and uploaded the required file.",
          "error"
        );
      } else {
        this.dialog = true;
      }
    },
    async confirmRelease() {
      if (this.injusticeReported === "yes" && this.selectedFile) {
        const formData = new FormData();
        formData.append("file", this.selectedFile);

        try {
          await axios.post("/sections/uploadInjusticeReport", formData);
        } catch (error) {
          console.error("Error uploading file:", error);
          this.showToast("Failed to upload report. Try again.", "error");
          return;
        }
      }

      this.dialog = false;

      try {
        const sectionId = this.user.sectionObserved.id;
        const userId = this.user.id;

        const response = await axios.put("/composed/release-section", {
          sectionId,
          userId,
        });

        this.user.observe = false;
        this.user.sectionObserved = null;

        this.showToast("Section released successfully!", "success");
        console.log(response.data);
      } catch (error) {
        console.error("Error releasing section:", error);

        this.showToast(
          error.response?.data ||
            "Failed to release section. Please try again.",
          "error"
        );
      }
    },
    showToast(message, type) {
      this.toast.message = message;
      this.toast.color = type === "success" ? "green" : "red";
      this.toast.show = true;
    },
  },
};
</script>

<style scoped>
.upsideText {
  font-size: 0.8rem;
}

.subtitle {
  padding: 1rem 0;
}

.status {
  margin: 4rem auto;
  padding: 2rem;
  background-color: var(--var--dark-blue);
  width: 50%;
  border-radius: 2rem;
  border: 1px solid var(--var--light-white);
  color: var(--var--light-white);
}

.infoText {
  padding: 0.7rem;
  border-radius: 2rem 0;
  border-top: 0.2rem solid var(--var--light-white);
  border-right: 0.1rem solid var(--var--light-white);
}

.release-button {
  padding: 0.8rem 2rem;
  color: var(--var--light-white);
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 2rem 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.release-button:hover {
  background-color: var(--var--medium-blue);
  transform: scale(1.05);
}

.release-button:active {
  background-color: var(--var--medium-blue);
}

.container-release-button {
  display: flex;
  justify-content: center;
  padding: 2rem 0 0 0;
}

.redirect-link {
  color: var(--var--medium-blue);
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.redirect-link:hover {
  color: var(--var--light-blue);
}
@media screen and (max-width: 900px) {
  .status {
    width: 80%;
  }
  .v-main {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
