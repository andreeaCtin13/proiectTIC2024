<template>
  <div>
    <v-container class="container">
      <v-row class="filterSearch">
        <v-col cols="12" sm="8" v-if="sections.length > 0">
          <v-text-field
            v-model="search"
            :label="getSearchLabel"
            append-icon="mdi-magnify"
            @input="handleSearchInput"
            outlined
            clearable
            @click:clear="clearSearch"
            :error-messages="searchError"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" v-if="sections.length > 0">
          <v-select
            v-model="searchField"
            :items="searchFields"
            label="Search by"
            outlined
            @change="handleSearchFieldChange"
          ></v-select>
        </v-col>
      </v-row>

      <div class="infinite-scroll" ref="infiniteScroll">
        <div v-for="item in sections" :key="item.id" class="section-item">
          <div @click="openModal(item)" class="clickable">
            <p><strong>Address:</strong> {{ item.address }}</p>
            <p><strong>County:</strong> {{ item.county }}</p>
            <p><strong>Location:</strong> {{ item.location }}</p>
            <p><strong>Number:</strong> {{ item.number }}</p>
          </div>
        </div>

        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="loading-spinner"
        ></v-progress-circular>

        <div v-if="!loading && !sections.length">
          <div v-if="!hasValidElections" class="no-election-message">
            <p>Sorry, you are not signed up for any valid elections.</p>
          </div>
          <div v-else class="no-election-message">
            <p>No voting sections match your search filters.</p>
          </div>
        </div>
      </div>

      <v-dialog v-model="isModalOpen" max-width="600px">
        <v-card>
          <v-card-title>
            <div class="d-flex align-center w-100">
              <h2>Section Details</h2>
              <v-spacer></v-spacer>
              <v-btn icon @click="closeModal" class="btnClose">
                <v-icon class="x-icon">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <p><strong>Address:</strong> {{ selectedSection.address }}</p>
            <p><strong>County:</strong> {{ selectedSection.county }}</p>
            <p><strong>Location:</strong> {{ selectedSection.location }}</p>
            <p><strong>Number:</strong> {{ selectedSection.number }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              text
              @click="handleObserveClick"
              :disabled="user.observe"
            >
              Observe Section
            </v-btn>
            <v-btn color="grey" text @click="closeModal">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="showSnackbar" :timeout="3000" :color="snackbarColor">
        {{ snackbarText }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import axios from "../../axios";
import debounce from "lodash/debounce";
import { inject } from "vue";

export default {
  setup() {
    const user = inject("user");
    return { user };
  },
  data() {
    return {
      search: "",
      searchError: "",
      searchField: "number",
      searchFields: ["county", "number"],
      sections: [],
      loading: false,
      totalItems: 0,
      isModalOpen: false,
      selectedSection: {},
      showSnackbar: false,
      snackbarText: "",
      snackbarColor: "error",
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      hasValidElections: true,
    };
  },
  computed: {
    getSearchLabel() {
      return this.searchField === "number"
        ? "Search by number..."
        : "Search...";
    },
  },
  methods: {
    validateSearch() {
      this.searchError = "";
      if (this.searchField === "number" && this.search) {
        if (isNaN(parseFloat(this.search))) {
          this.searchError = "Please enter a valid number";
          return false;
        }
      }
      return true;
    },
    async fetchSections() {
      if (!this.validateSearch() || this.loading) return;

      this.loading = true;
      try {
        const userElectionsResponse = await axios.get(
          `/users/${this.user.id}/elections`
        );

        const validElections = userElectionsResponse.data;
        if (validElections.length === 0) {
          this.sections = [];
          this.totalItems = 0;
          this.hasValidElections = false;
          return;
        }

        this.hasValidElections = true;

        const params = {
          page: this.options.page,
          itemsPerPage: this.options.itemsPerPage,
          search: this.search,
          searchField: this.searchField,
          elections: validElections.map((election) => election.id),
        };

        const { data } = await axios.get("/sections", { params });

        this.sections = [...this.sections, ...data.items];
        this.totalItems = data.total;
        this.options.page++;
      } catch (error) {
        console.error("Error fetching sections:", error);
        this.showSnackbarMessage("Error loading sections", "error");
      } finally {
        this.loading = false;
      }
    },
    handleSearchInput: debounce(function () {
      if (this.validateSearch()) {
        this.resetSections();
      }
    }, 300),
    resetSections() {
      this.sections = [];
      this.options.page = 1;
      this.fetchSections();
    },
    handleSearchFieldChange() {
      this.search = "";
      this.searchError = "";
      this.resetSections();
    },
    clearSearch() {
      this.search = "";
      this.searchError = "";
      this.resetSections();
    },
    openModal(item) {
      this.selectedSection = item;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedSection = {};
    },
    showSnackbarMessage(text, color = "error") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },
    async handleObserveClick() {
      if (this.user.observe) {
        this.showSnackbarMessage(
          "Already observing another section",
          "warning"
        );
        return;
      }
      try {
        const sectionId = this.selectedSection.id;
        await axios.patch(`/composed/${sectionId}/observe`, {
          userId: this.user.id,
          observerEmail: this.user.email,
        });
        this.user.observe = true;
        this.user.sectionObserved = { ...this.selectedSection };
        this.showSnackbarMessage("Section successfully assigned", "success");
        this.closeModal();
        this.resetSections();
      } catch (error) {
        console.error("Error observing section:", error);
        this.showSnackbarMessage(
          "Failed to observe section. Please try again."
        );
      }
    },
    handleScroll() {
      const container = this.$refs.infiniteScroll;
      if (
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50
      ) {
        this.fetchSections();
      }
    },
  },
  mounted() {
    const container = this.$refs.infiniteScroll;
    container.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    const container = this.$refs.infiniteScroll;
    container.removeEventListener("scroll", this.handleScroll);
  },
  created() {
    this.fetchSections();
  },
};
</script>

<style scoped>
.container {
  padding: 4rem 0;
}
.infinite-scroll {
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.section-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.section-item:last-child {
  border-bottom: none;
}

.section-item:hover {
  background-color: #f1f1f1;
}

.no-election-message {
  text-align: center;
  font-size: 1.2rem;
  color: var(--var--close-red);
  margin-top: 2rem;
}

.clickable {
  color: var(--var--dark-blue);
  transition: color 0.3s ease;
}

.clickable:hover {
  color: var(--var--close-red);
}

@media screen and (max-width: 900px) {
  .container {
    padding: 0;
    margin: 0 0.5rem;
  }
  .v-row {
    max-width: 95%;
  }
  .infinite-scroll {
    max-width: 95%;
  }
}
</style>
