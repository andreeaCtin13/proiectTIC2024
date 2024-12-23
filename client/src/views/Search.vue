<template>
  <div>
    <v-container>
      <v-text-field
        v-model="search"
        label="Search"
        append-icon="mdi-magnify"
        @input="fetchSections"
        outlined
        class="mb-4"
      ></v-text-field>

      <v-data-table
        :headers="headers"
        :items="sections"
        :options.sync="options"
        :server-items-length="totalItems"
        :loading="loading"
        class="elevation-1"
        @update:options="fetchSections"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Sections Table</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
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
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      search: "",
      sections: [],
      totalItems: 0,
      loading: false,
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
    };
  },
  watch: {
    options: {
      handler() {
        this.fetchSections();
      },
      deep: true,
    },
  },
  methods: {
    async fetchSections() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const response = await axios.get("/sections", {
          params: {
            page,
            itemsPerPage,
            search: this.search,
          },
        });
        this.sections = response.data.items;
        this.totalItems = response.data.total;
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      } finally {
        this.loading = false;
      }
    },
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
</style>
