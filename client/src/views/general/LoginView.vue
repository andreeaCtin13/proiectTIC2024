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
import axios from "../../axios";
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
          } catch (storageError) {
            console.error("Failed to save token:", storageError);
            throw new Error("Failed to store authentication token");
          }
        } else {
          console.error("Invalid token received:", token);
          throw new Error("No valid token received from server");
        }

        toastr.success("Login successful!", "Success");

        if (!this.user) {
          console.error("User context is not provided");
          toastr.error("Application error: User context is missing", "Error");
          return;
        }

        const userData = response.data?.user || {};
        localStorage.setItem("user_data", JSON.stringify(userData));

        console.log("USER DATA : ", userData);
        this.user.email = userData.email || "N/A";
        this.user.role = userData.role || "guest";
        this.user.id = userData.id || "";
        this.user.observe = userData.observe || false;
        if (userData.observe) {
          this.user.sectionObserved = { ...userData.sectionObserved };
        }
        console.log("user in login", this.user);

        const route =
          this.user.role === "observer"
            ? "/observer-homepage"
            : "/admin-homepage";
        console.log("Navigating to:", route);
        this.$router.push(route);
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred";

        if (errorMessage === "No account found for this email") {
          toastr.error(errorMessage, "Login Failed");
        } else if (errorMessage === "Incorrect password") {
          toastr.error(errorMessage, "Login Failed");
        } else {
          toastr.error(errorMessage, "Login Failed");
        }
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
