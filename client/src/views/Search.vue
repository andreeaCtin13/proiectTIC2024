<template>
  <div>
    <v-container>
      <!-- Search and Select -->
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

      <!-- Datatable -->
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

        <!-- Row Slots -->
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

      <!-- Modal -->
      <v-dialog v-model="isModalOpen" max-width="600px">
        <v-card>
          <v-card-title>
            Section Details
            <v-spacer></v-spacer>
            <v-btn icon @click="isModalOpen = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <p><strong>Address:</strong> {{ selectedSection.address }}</p>
            <p><strong>County:</strong> {{ selectedSection.county }}</p>
            <p><strong>Location:</strong> {{ selectedSection.location }}</p>
            <p><strong>Number:</strong> {{ selectedSection.number }}</p>
          </v-card-text>
          <v-card-actions>
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
import axios from "../axios";
import debounce from "lodash/debounce";

export default {
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
      isModalOpen: false, // Modal visibility
      selectedSection: {}, // Data for selected row
    };
  },
  methods: {
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
  background-color: #3f51b5;
  color: white;
}
.padding {
  margin: 4rem 0;
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
  color: #1976d2;
}
.clickable:hover {
  text-decoration: underline;
}
</style>
