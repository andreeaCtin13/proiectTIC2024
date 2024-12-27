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

        <template v-slot:[`column.address`]="{ column }">
          <span class="header">{{ column.text }}</span>
        </template>
        <template v-slot:[`column.county`]="{ column }">
          <span class="header">{{ column.text }}</span>
        </template>
        <template v-slot:[`column.location`]="{ column }">
          <span class="header">{{ column.text }}</span>
        </template>
        <template v-slot:[`column.number`]="{ column }">
          <span class="header">{{ column.text }}</span>
        </template>

        <template v-slot:[`item.address`]="{ item }">
          {{ item.address }}
        </template>
        <template v-slot:[`item.county`]="{ item }">
          {{ item.county }}
        </template>
        <template v-slot:[`item.location`]="{ item }">
          {{ item.location }}
        </template>
        <template v-slot:[`item.number`]="{ item }">
          {{ item.number }}
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
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
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

        const response = await axios.get("http://localhost:3000/sections", {
          params,
        });

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
</style>
