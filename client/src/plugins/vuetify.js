// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";

export default createVuetify(
  {
    theme: {
      themes: {
        light: {
          colors: {
            darkblue: "#5b8e85",
            lightblue: "#b6ccc9",
            lightwhite: "#fdfdfd",
            darkwhitebluish: "#e1e9e8",
            mediumblue: "#84a9a3",
            lightblack: "#28282",
          },
        },
      },
    },
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
);
