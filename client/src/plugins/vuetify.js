// src/plugins/vuetify.js
import { createVuetify } from "vuetify";
import "vuetify/styles"; // Asigură-te că Vuetify Styles este importat
import "@mdi/font/css/materialdesignicons.css"; // Import Material Design Icons

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi", // Setează Material Design Icons ca set implicit
  },
});

export default vuetify;
