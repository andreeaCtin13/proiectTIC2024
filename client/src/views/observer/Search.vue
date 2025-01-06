<template>
  <div>
    <v-container>
      <v-text-field
        v-model="search"
        label="Search"
        append-icon="mdi-magnify"
        @input="debouncedFetchSections"
        outlined
        class="mb-4 padding"
      ></v-text-field>

      <v-select
        v-model="searchField"
        :items="searchFields"
        label="Search by"
        outlined
        class="mb-4"
        @change="fetchSections"
      ></v-select>

      <v-data-table
        :items="sections"
        :options.sync="options"
        :loading="loading"
        class="elevation-1 table"
        @update:model-value="itemsPerPage = parseInt($event, 10)"
        @update:options="fetchSections"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Sections</v-toolbar-title>
          </v-toolbar>
        </template>

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

        <template v-slot:bottom>
          <div class="text-center pt-2">
            <v-pagination
              v-model="options.page"
              :length="pageCount"
              @input="fetchSections"
            />
          </div>
        </template>
      </v-data-table>

      <v-dialog v-model="isModalOpen" max-width="600px">
        <v-card>
          <v-card-title>
            <div class="flex">
              <h2>Section Details</h2>
              <v-spacer></v-spacer>
              <v-btn icon @click="isModalOpen = false" class="btnClose">
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
            <v-snackbar v-model="showSnackbar" :timeout="3000" color="red">
              Already observing another section.
            </v-snackbar>

            <v-btn
              color="primary"
              text
              @click="handleObserveClick"
              :disabled="user.observe"
            >
              Observe Section
            </v-btn>

            <v-btn color="primary" text @click="isModalOpen = false"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
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
    return {
      user,
    };
  },
  data() {
    return {
      search: "",
      searchField: "address",
      searchFields: ["None", "address", "county", "location", "number"],
      sections: [],
      totalItems: 0,
      loading: false,
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      pageCount: 1,
      headers: [
        { text: "Address", value: "address" },
        { text: "County", value: "county" },
        { text: "Location", value: "location" },
        { text: "Number", value: "number" },
      ],
      isModalOpen: false,
      selectedSection: {},
      showSnackbar: false,
    };
  },
  methods: {
    handleObserveClick() {
      if (this.user.observe) {
        this.showSnackbar = true;
      } else {
        this.observeSection();
      }
    },
    async fetchSections() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const params = {
          page,
          itemsPerPage,
          search: this.search,
          searchField: this.searchField !== "None" ? this.searchField : null,
        };
        const response = await axios.get("/sections", { params });
        this.sections = response.data.items;
        this.totalItems = response.data.total;
        this.pageCount = Math.ceil(this.totalItems / itemsPerPage);
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        this.loading = false;
      }
    },
    debouncedFetchSections: debounce(function () {
      this.fetchSections();
    }, 300),
    openModal(item) {
      this.selectedSection = item;
      this.isModalOpen = true;
    },
    async observeSection() {
      try {
        const sectionId = this.selectedSection.id;
        const userId = this.user.id;

        await axios.patch(`/composed/${sectionId}/observe`, {
          userId,
          observerEmail: this.user.email,
        });

        this.user.observe = true;
        this.user.sectionObserved = {
          ...this.selectedSection,
        };

        this.isModalOpen = false;
        this.fetchSections();
      } catch (error) {
        console.error("Error observing section:", error);
        alert("Failed to observe section. Please try again.");
      }
    },
  },
  watch: {
    "options.page": "fetchSections",
  },
  created() {
    this.fetchSections();
  },
};
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.v-data-table-header {
  background-color: var(--var--dark-blue);
  color: white;
}
.padding {
  margin: 2rem 0;
}
.table {
  margin-bottom: 2rem;
  margin-top: 0;
}
.header {
  color: black !important;
  font-size: 2rem;
}
.clickable {
  cursor: pointer;
  color: var(--var--dark-blue);
  transition: 0.3s;
}
.clickable:hover {
  color: var(--var--close-red);
}

.flex {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
}
.btnClose {
  background-color: var(--var--close-red);
}

.x-icon {
  color: var(--var--light-white);
}
</style>
