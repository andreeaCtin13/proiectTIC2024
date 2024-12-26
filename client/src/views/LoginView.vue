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
import axios from "axios";
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
      const baseUrl = "http://localhost:3000";

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
        const response = await axios.post(`${baseUrl}/login`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        toastr.success("Login successful!", "Success");

        if (!this.user) {
          throw new Error("User context is not provided");
        }
        this.user.email = response.data?.user?.email;
        this.user.role = response.data?.user?.role;
        console.log("user in login", this.user);

        if (this.user.role === "observer") {
          this.$router.push("/observer-homepage");
          return;
        } else {
          this.$router.push("/admin-homepage");
          return;
        }
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data || "An unexpected error occurred";
        toastr.error(errorMessage, "Login Failed");
        return;
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
