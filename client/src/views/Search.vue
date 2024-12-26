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
            <v-toolbar-title>Sections</v-toolbar-title>
          </v-toolbar>
        </template>

        <!-- Afisarea antetelor -->
        <template v-slot:[`column.address`]="{ column }">
          <span>{{ column.text }}</span>
        </template>
        <template v-slot:[`column.county`]="{ column }">
          <span>{{ column.text }}</span>
        </template>
        <template v-slot:[`column.location`]="{ column }">
          <span>{{ column.text }}</span>
        </template>
        <template v-slot:[`column.number`]="{ column }">
          <span>{{ column.text }}</span>
        </template>

        <!-- Afișarea datelor -->
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
      const baseUrl = "http://localhost:3000";

      try {
        const { page, itemsPerPage } = this.options;
        const response = await axios.get(`${baseUrl}/sections`, {
          params: {
            page,
            itemsPerPage,
            search: this.search,
          },
        });

        this.sections = response.data.items;
        this.totalItems = response.data.total;
        console.log("total", response.data.total);
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

/* Stilizare pentru antete */
.v-data-table-header {
  background-color: #3f51b5; /* Culoare de fundal pentru antete */
  color: white;
}

.v-data-table-header th {
  font-weight: bold;
}
</style>
