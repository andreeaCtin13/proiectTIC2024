<template>
  <div>
    <v-app-bar :elevation="2" class="navbar">
      <v-app-bar-title>
        <h1 class="titleNav">ObservErr<span class="spanNav">(ors)</span></h1>
      </v-app-bar-title>
      <div class="links-container">
        <router-link
          to="/search"
          class="nav-link"
          v-if="user && user.role === 'observer'"
          >Search for a section</router-link
        >
        <router-link
          to="/stats"
          v-if="user && user.role === 'admin'"
          class="nav-link"
          >Statistics</router-link
        >
        <span v-if="user && user.role === 'observer'">|</span>

        <router-link
          to="/current-status"
          class="nav-link"
          v-if="user && user.role === 'observer'"
          >Current status</router-link
        >
        |
        <router-link
          to="/admin-homepage"
          v-if="user && user.role === 'admin'"
          class="nav-link"
          >Administrator Homepage</router-link
        >
        <router-link
          to="/observer-homepage"
          v-if="user && user.role === 'observer'"
          class="nav-link"
          >Observer Homepage</router-link
        >
        |
        <router-link to="/" class="nav-link" @click.prevent="handleLogout"
          >Logout</router-link
        >
      </div>
    </v-app-bar>
    <v-bottom-navigation class="bottom-nav">
      <router-link
        class="link"
        to="/search"
        v-if="user && user.role === 'observer'"
      >
        <v-icon>mdi-magnify</v-icon>
        <span>Search</span>
      </router-link>
      <router-link
        class="link"
        to="/stats"
        v-if="user && user.role === 'admin'"
      >
        <v-icon>mdi-chart-bar</v-icon>
        <span>Stats</span>
      </router-link>
      <router-link
        class="link"
        to="/current-status"
        v-if="user && user.role === 'observer'"
      >
        <v-icon>mdi-clock-outline</v-icon>
        <span>Status</span>
      </router-link>
      <router-link
        to="/admin-homepage"
        class="link"
        v-if="user && user.role === 'admin'"
      >
        <v-icon>mdi-account-tie</v-icon>
        <span>Admin</span>
      </router-link>
      <router-link
        to="/observer-homepage"
        class="link"
        v-if="user && user.role === 'observer'"
      >
        <v-icon>mdi-binoculars</v-icon>
        <span>Observer</span>
      </router-link>
      <router-link class="link" to="/" @click.prevent="handleLogout">
        <v-icon>mdi-logout</v-icon>
        <span>Logout</span>
      </router-link>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { inject } from "vue";
import { useRouter } from "vue-router";
import axios from "../axios";
export default {
  name: "Navigation",
  setup(_, { emit }) {
    const user = inject("user");
    const router = useRouter();

    const handleLogout = async () => {
      try {
        await axios.post("/logout", { method: "POST", credentials: "include" });
        sessionStorage.clear();
        localStorage.removeItem("user_data");
        emit("logout");
        router.push("/");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    return { user, handleLogout };
  },
};
</script>

<style>
.titleNav {
  color: var(--var--light-black);
  font-size: 2rem;
}

.spanNav {
  font-size: 1rem;
}

.navbar {
  height: 6rem;
  display: flex !important;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.links-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  font-size: 1.2rem;
  color: var(--var--light-black);
  font-weight: 500;
  transition: color 0.3s, transform 0.3s;
}

.nav-link:hover {
  color: var(--var--dark-blue);
  transform: scale(1.1);
}

.nav-link:active {
  color: var(--var--dark-blue);
}

.nav-link + .nav-link {
  margin-left: 1rem;
}

.bottom-nav {
  display: none;
}

@media (max-width: 950px) {
  .navbar {
    display: none !important;
  }

  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    width: 100%;
    min-height: 5rem;
    background-color: white;
    justify-content: space-around;
    border-top: 1px solid #ccc;
  }

  .link {
    text-decoration: none;
    color: var(--var--light-black);
    font-size: 1.1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0.7rem 1rem;
  }
}
</style>
