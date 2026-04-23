<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🎥 Vibe Meeting</h1>
      <p class="subtitle">Experience seamless video conferencing</p>

      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Enter your name"
          @keyup.enter="handleLogin"
        />
      </div>

      <button
        @click="handleLogin"
        class="btn btn-primary"
        :disabled="!username.trim()"
      >
        {{ isLoading ? "Logging in..." : "Enter Vibe Meeting" }}
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="info-text">
        <p>💡 For testing: Any username works</p>
        <p>🔐 Production: Google OAuth will be used</p>
      </div>
    </div>

    <div class="background-elements">
      <div class="element element-1"></div>
      <div class="element element-2"></div>
      <div class="element element-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const username = ref("");
const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  if (!username.value.trim()) {
    error.value = "Please enter a username";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    // Simulate OAuth verification
    const mockGoogleToken = `mock_token_${Date.now()}`;

    // In production, you would make a real API call to /auth/verify
    // const response = await fetch('http://localhost:3001/auth/verify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ googleToken: mockGoogleToken })
    // });

    // For MVP, simulate the response
    const userData = {
      userId: `user_${Date.now()}`,
      userName: username.value,
      email: `${username.value}@vibe.local`,
      token: `token_${Date.now()}_${Math.random()}`,
    };

    userStore.setUser(userData);
    router.push("/dashboard");
  } catch (err) {
    error.value = `Login failed: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
}

.login-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  position: relative;
  z-index: 10;
}

.login-card h1 {
  margin: 0 0 0.5rem 0;
  text-align: center;
  color: #667eea;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 2rem 0;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.info-text {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  font-size: 0.85rem;
  color: #999;
  text-align: center;
}

.info-text p {
  margin: 0.35rem 0;
}

.background-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.element {
  position: absolute;
  opacity: 0.1;
}

.element-1 {
  width: 300px;
  height: 300px;
  background: white;
  border-radius: 50%;
  top: -150px;
  left: -150px;
}

.element-2 {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 50%;
  bottom: -100px;
  right: -100px;
}

.element-3 {
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 50%;
  top: 50%;
  right: 10%;
}
</style>
