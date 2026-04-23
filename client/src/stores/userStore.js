/**
 * User Store
 * Manages authentication state and user data
 * Persisted to localStorage
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore(
  "user",
  () => {
    const userId = ref(null);
    const userName = ref(null);
    const email = ref(null);
    const token = ref(null);
    const isAuthenticated = computed(() => !!token.value);

    const setUser = (userData) => {
      userId.value = userData.userId;
      userName.value = userData.userName;
      email.value = userData.email;
      token.value = userData.token;
    };

    const logout = () => {
      userId.value = null;
      userName.value = null;
      email.value = null;
      token.value = null;
    };

    return {
      userId,
      userName,
      email,
      token,
      isAuthenticated,
      setUser,
      logout,
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: "vibe_user",
          storage: localStorage,
          paths: ["userId", "userName", "email", "token"],
        },
      ],
    },
  },
);
