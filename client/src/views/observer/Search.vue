<template>
  <div>
    <v-container class="container">
      <v-row>
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

      <div v-if="sections.length > 0">
        <v-data-table
          :headers="headers"
          :items="sections"
          :options.sync="options"
          :server-items-length="totalItems"
          :loading="loading"
          :footer-props="{
            'items-per-page-options': [5, 10, 20, 50],
            'items-per-page-text': 'Rows per page:',
            showFirstLastPage: true,
            'show-current-page': true,
          }"
          @update:model-value="itemsPerPage = parseInt($event, 10)"
          @update:options="handleTableUpdate"
          class="elevation-1"
        >
          <!-- Slot Templates -->
          <template v-slot:[`item.address`]="{ item }">
            <span @click="openModal(item)" class="clickable">{{
              item.address
            }}</span>
          </template>
          <template v-slot:[`item.county`]="{ item }">
            <span @click="openModal(item)" class="clickable">{{
              item.county
            }}</span>
          </template>
          <template v-slot:[`item.location`]="{ item }">
            <span @click="openModal(item)" class="clickable">{{
              item.location
            }}</span>
          </template>
          <template v-slot:[`item.number`]="{ item }">
            <span @click="openModal(item)" class="clickable">{{
              item.number
            }}</span>
          </template>
        </v-data-table>
      </div>

      <div v-else class="no-election-message">
        <p>Sorry there is no election you signed up for observing.</p>
      </div>

      <!-- Modal -->
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
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      headers: [
        { text: "Address", value: "address" },
        { text: "County", value: "county" },
        { text: "Location", value: "location" },
        { text: "Number", value: "number" },
      ],
      isModalOpen: false,
      selectedSection: {},
      showSnackbar: false,
      snackbarText: "",
      snackbarColor: "error",
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
    handleTableUpdate(newOptions) {
      this.options = { ...this.options, ...newOptions };
      this.fetchSections();
    },
    async fetchSections() {
      if (!this.validateSearch()) return;

      this.loading = true;
      try {
        const userElectionsResponse = await axios.get(
          `/users/${this.user.id}/elections`
        );

        const validElections = userElectionsResponse.data;
        console.log("VALID ELECTIONS:", validElections.length);

        if (validElections.length === 0) {
          this.sections = [];
          this.totalItems = 0;
          return;
        }

        const params = {
          page: this.options.page,
          itemsPerPage: this.options.itemsPerPage,
          search: this.search,
          searchField: this.searchField,
          // elections: validElections.map((election) => election.id),
        };

        const { data } = await axios.get("/sections", { params });

        this.sections = data.items;
        this.totalItems = data.total;
      } catch (error) {
        console.error("Error fetching sections:", error);
        this.showSnackbarMessage("Error loading sections", "error");
      } finally {
        this.loading = false;
      }
    },
    handleSearchInput: debounce(function () {
      if (this.validateSearch()) this.fetchSections();
    }, 300),
    handleSearchFieldChange() {
      this.search = "";
      this.searchError = "";
      this.fetchSections();
    },
    clearSearch() {
      this.search = "";
      this.searchError = "";
      this.fetchSections();
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
        this.fetchSections();
      } catch (error) {
        console.error("Error observing section:", error);
        this.showSnackbarMessage(
          "Failed to observe section. Please try again."
        );
      }
    },
  },
  watch: {
    options: {
      handler() {
        this.fetchSections();
      },
      deep: true,
    },
  },
  created() {
    this.fetchSections();
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
  color: var(--var--dark-blue);
  transition: color 0.3s ease;
}

.clickable:hover {
  color: var(--var--close-red);
}

.btnClose {
  background-color: var(--var--close-red);
}

.x-icon {
  color: var(--var--light-white);
}

.container {
  padding: 4rem 0;
}

.no-election-message {
  text-align: center;
  font-size: 1.2rem;
  color: var(--var--close-red);
  margin-top: 2rem;
}

@media screen and (max-width: 900px) {
  .v-data-table {
    font-size: 0.8rem;
  }
  .container {
    padding: 0;
  }
}
</style>
