<template>
  <div>
    <v-container>
      <v-row class="containerStats">
        <v-col>
          <v-card>
            <v-card-title>Total Observations</v-card-title>
            <v-card-text>
              <v-progress-linear
                :value="totalObservations"
                :max="maxObservations"
                color="primary"
                height="20"
              />
              <div class="text-h5">{{ totalObservations }} Observations</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title>Most Observed Section</v-card-title>
            <v-card-text>
              <div class="text-h5">
                {{ mostObservedSection.number }} -
                {{ mostObservedSection.location }}
              </div>
              <div>
                {{ mostObservedSection.county }} |
                {{ mostObservedSection.address }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col>
          <v-card>
            <v-card-title>Average Duration</v-card-title>
            <v-card-text>
              <v-progress-linear
                :value="averageDuration"
                :max="maxDuration"
                color="secondary"
                height="20"
              />
              <div class="text-h5">{{ averageDuration }} minutes</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>Observations per Section</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="tableHeaders"
                :items="sectionStats"
                item-value="sectionId"
              >
                <template v-slot:item="{ item }">
                  <tr>
                    <td>{{ item.number || "N/A" }}</td>
                    <td>{{ item.location || "N/A" }}</td>
                    <td>{{ item.county || "N/A" }}</td>
                    <td>{{ item.address || "N/A" }}</td>
                    <td>{{ item.count || 0 }}</td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from "../../axios";
import { Bar } from "vue-chartjs";
import { reactive, ref, onMounted } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  BarElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  BarElement,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default {
  components: {
    "v-bar-chart": Bar,
  },
  setup() {
    const totalObservations = ref(0);
    const averageDuration = ref(0);
    const mostObservedSection = ref({});
    const sectionStats = ref([]);
    const sectionChartData = reactive({
      labels: [],
      datasets: [
        {
          label: "Observations",
          backgroundColor: "#42A5F5",
          data: [],
        },
      ],
    });
    const tableHeaders = [
      { title: "Number", key: "number" },
      { title: "Location", key: "location" },
      { title: "County", key: "county" },
      { title: "Address", key: "address" },
      { title: "Observations", key: "count" },
    ];

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    };

    const maxObservations = 100;
    const maxDuration = 120;
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("/statistics");
        const data = response.data;
        console.log("Statistics data:", data);

        totalObservations.value = data.totalObservations;
        averageDuration.value = data.averageDuration;
        mostObservedSection.value = data.mostObservedSection;

        sectionStats.value = data.sectionStats;

        sectionChartData.labels = sectionStats.value.map(
          (item) => item?.number
        );
        sectionChartData.datasets[0].data = sectionStats.value.map(
          (item) => item.count
        );
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    onMounted(fetchStatistics);

    return {
      totalObservations,
      averageDuration,
      mostObservedSection,
      sectionStats,
      sectionChartData,
      tableHeaders,
      chartOptions,
      maxObservations,
      maxDuration,
    };
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 1rem;
}

.containerStats {
  padding: 3rem 0 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
