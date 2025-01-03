<template>
  <v-app>
    <v-sheet class="full-space login">
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

            <br />

            <v-btn
              color="darkblue"
              size="large"
              type="submit"
              variant="elevated"
              block
            >
              Login
            </v-btn>
            <br />

            <v-btn
              color="failed"
              size="large"
              variant="elevated"
              @click="register"
              block
            >
              Register
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-sheet>
  </v-app>
</template>

<script>
import axios from "../axios";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { useRouter } from "vue-router";
import { inject } from "vue";

export default {
  name: "LoginView",
  setup() {
    const router = useRouter();
    const user = inject("user");

    const register = () => {
      router.push("/register");
    };

    return {
      register,
      user,
    };
  },

  data: () => ({
    form: false,
    email: null,
    password: null,
    loading: false,
  }),

  methods: {
    async onSubmit() {
      if (!this.form) {
        toastr.error(
          "Please fill out all fields correctly!",
          "Validation Error"
        );
        return;
      }

      const data = {
        email: this.email,
        password: this.password,
      };

      this.loading = true;

      try {
        const response = await axios.post("/login", data, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const token = response.data?.token;
        if (token && typeof token === "string" && token.length > 0) {
          try {
            sessionStorage.setItem("auth_token", token);
            console.log("Token saved:", token);
          } catch (storageError) {
            console.error("Failed to save token:", storageError);
            throw new Error("Failed to store authentication token");
          }
        } else {
          console.error("Invalid token received:", token);
          throw new Error("No valid token received from server");
        }

        // Mesaj de succes
        toastr.success("Login successful!", "Success");

        // Asigură-te că user-ul există
        if (!this.user) {
          console.error("User context is not provided");
          toastr.error("Application error: User context is missing", "Error");
          return;
        }

        // Actualizează datele utilizatorului
        const userData = response.data?.user || {};
        console.log("USER DATA : ", userData);
        this.user.email = userData.email || "N/A";
        this.user.role = userData.role || "guest";
        this.user.id = userData.id || "";

        console.log("user in login", this.user);

        // Navigare pe baza rolului
        const route =
          this.user.role === "observer"
            ? "/observer-homepage"
            : "/admin-homepage";
        console.log("Navigating to:", route);
        this.$router.push(route);
      } catch (error) {
        console.error("Login error:", error);
        toastr.error(
          error?.response?.data?.message || "An unexpected error occurred",
          "Login Failed"
        );
      } finally {
        this.loading = false;
      }
    },

    required(v) {
      return !!v || "Field is required";
    },
  },
};
</script>

<style scoped>
.title {
  color: var(--var--light-black);
  font-size: 8rem;
}

.span {
  font-size: 4rem;
}

.login {
  text-align: center;
  display: flex;
  flex-direction: column;
}

.btn {
  margin: 2rem;
  font-size: 2rem;
}
</style>
