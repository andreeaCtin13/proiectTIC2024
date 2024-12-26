<template>
  <div>
    <v-container>
      <v-text-field
        v-model="search"
        label="Search"
        append-icon="mdi-magnify"
        @input="fetchSections"
        outlined
        class="mb-4 padding"
      ></v-text-field>

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

const column = {
  address: "address",
  county: "county",
  location: "location",
  number: "number",
};

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
        { text: "Address", value: column.address },
        { text: "County", value: column.county },
        { text: "Location", value: column.location },
        { text: "Number", value: column.number },
      ],
    };
  },
  computed: {
    pageCount() {
      return this.totalItems > 0
        ? Math.ceil(this.totalItems / this.options.itemsPerPage)
        : 1;
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

        this.sections = response.data.items.map((item) => {
          const { id, ...rest } = item;
          return rest;
        });

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
