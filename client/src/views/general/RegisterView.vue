<template>
  <v-app>
    <v-sheet class=".3pa-12 m-0 full-space register">
      <h1 class="title">ObservErr<span class="span">(ors)</span></h1>

      <v-card class="mx-auto px-6 py-8" max-width="344">
        <v-form v-model="form" @submit.prevent="onSubmit" class="form">
          <div class="container">
            <v-text-field
              v-model="email"
              :readonly="loading"
              :rules="[required]"
              class="mb-2"
              label="Email"
              clearable
            ></v-text-field>

            <v-text-field
              v-model="password"
              :readonly="loading"
              :rules="[required]"
              class="mb-2"
              label="Password"
              placeholder="Enter your password"
              clearable
            ></v-text-field>

            <v-text-field
              v-model="confirmPassword"
              :readonly="loading"
              :rules="[required, passwordsMatch]"
              class="mb-2"
              label="Confirm Password"
              placeholder="Re-enter your password"
              clearable
            ></v-text-field>

            <br />

            <v-btn
              color="darkblue"
              size="large"
              type="submit"
              variant="elevated"
              block
            >
              Register
            </v-btn>
            <br />

            <v-btn
              @click="login"
              color="failed"
              size="large"
              type="submit"
              variant="elevated"
              block
            >
              Login
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-sheet>
  </v-app>
</template>
<script>
import axios from "../../axios";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { useRouter } from "vue-router";

export default {
  name: "RegisterView",
  data: () => ({
    form: false,
    email: null,
    password: null,
    confirmPassword: null,
    loading: false,
  }),
  setup() {
    const router = useRouter();

    const login = () => {
      router.push("/");
    };

    return {
      login,
    };
  },
  methods: {
    async onSubmit() {
      const baseUrl = "http://localhost:3000";

      if (!this.form) {
        toastr.error("Please complete all fields correctly!", "Error");
        return;
      }

      const data = {
        email: this.email,
        password: this.password,
      };

      this.loading = true;

      try {
        const response = await axios.post(`${baseUrl}/users`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        toastr.success("Registration successful!", "Success");
        console.log("Server Response:", response.data);

        this.$router.push("/");
      } catch (error) {
        console.error("Error during registration:", error);
        const errorMessage =
          error.response?.data || "An unexpected error occurred";
        toastr.error(
          errorMessage,
          "Registration Failed - " + error.response.data?.errors[0].msg
        );
      } finally {
        this.loading = false;
      }
    },

    required(v) {
      return !!v || "Field is required";
    },

    passwordsMatch(v) {
      return v === this.password || "Passwords do not match";
    },
  },
};
</script>

<style>
.title {
  color: var(--var--light-black);
  font-size: 8rem;
}

.span {
  font-size: 4rem;
}

.register {
  text-align: center;
  display: flex;
  flex-direction: column;
}

.full-space {
  background-color: var(--var--light-blue);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin: 0;
}

.form {
  min-width: 20rem;
}

.container {
  width: 90%;
}

@media screen and (max-width: 900px) {
  .title {
    font-size: 3.5rem;
    margin: 0 0 1rem 0;
  }
  .title span {
    font-size: 1.75rem;
  }
}
</style>
