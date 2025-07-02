import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { LOCAL_IP_ADDRESS } from "@env";

// Get the correct API URL based on environment
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development URLs
    if (Platform.OS === "ios") {
      return "http://localhost:8000/api/v1";
    } else if (Platform.OS === "android") {
      return `http://${LOCAL_IP_ADDRESS}:8000/api/v1`; // Android emulator
    } else {
      // For Expo Go or web
      return `http://${LOCAL_IP_ADDRESS}:8000/api/v1`; // Replace with your computer's IP
    }
  } else {
    // Production URL
    return "https://your-production-backend.com/api/v1";
  }
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Token management methods
  async getAuthToken() {
    try {
      // Try both possible token keys for backward compatibility
      let token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        token = await AsyncStorage.getItem("token");
      }
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      // Store with both keys for consistency
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  // Generic HTTP request method with better error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      timeout: 300000,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`Making request to: ${url}`);
      console.log("Request config:", {
        ...config,
        body: config.body ? "Present" : "None",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      } else {
        data = await response.text();
      }

      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (!response.ok) {
        const errorMessage =
          data?.detail ||
          data?.message ||
          data ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("Network/API Error:", error);

      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      } else if (error.message.includes("Network request failed")) {
        throw new Error(
          "Network connection failed. Please check your internet connection and ensure the backend server is running."
        );
      } else if (error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check if the backend is running on the correct port."
        );
      }

      throw error;
    }
  }

  // Test connection to backend
  async testConnection() {
    try {
      const response = await fetch(
        `${this.baseURL.replace("/api/v1", "")}/health`,
        {
          method: "GET",
          timeout: 5000,
        }
      );
      return { success: response.ok, status: response.status };
    } catch (error) {
      console.error("Connection test failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Authentication endpoints
  async register(userData) {
    try {
      const response = await this.makeRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: userData.fullName,
          email: userData.email,
          username: userData.username || userData.email.split("@")[0],
          password: userData.password,
        }),
      });

      if (response.access_token) {
        await this.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await this.makeRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (response.access_token) {
        await this.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.makeRequest("/auth/me");
    } catch (error) {
      console.error("Get current user error:", error);

      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        await this.removeAuthToken();
      }

      throw error;
    }
  }

  async logout() {
    try {
      // Call logout endpoint to invalidate token on server
      await this.makeRequest("/auth/logout", {
        method: "POST",
      });

      // Remove token from local storage
      await this.removeAuthToken();

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, remove local token
      await this.removeAuthToken();
      return { success: true };
    }
  }

  async deleteAccount() {
    try {
      await fetch(`${this.baseURL}/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
          Accept: "application/json",
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to delete account: ${response.status} ${response.statusText}`
          );
        }
      });

      // Remove token after successful deletion
      await this.removeAuthToken();

      return { success: true };
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  }

  async isAuthenticated() {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return false;
      }

      await this.getCurrentUser();
      return true;
    } catch (error) {
      await this.removeAuthToken();
      return false;
    }
  }

  // Skin analysis endpoints
  async submitSkinAssessment(answers, additionalConcerns = null) {
    try {
      const response = await this.makeRequest("/skin/assessment", {
        method: "POST",
        body: JSON.stringify({
          answers: answers,
          additional_concerns: additionalConcerns,
        }),
      });

      return response;
    } catch (error) {
      console.error("Skin assessment error:", error);
      throw error;
    }
  }

  async getSkinProfile() {
    try {
      return await this.makeRequest("/skin/profile");
    } catch (error) {
      console.error("Get skin profile error:", error);
      throw error;
    }
  }

  async analyzeProduct(productName, ingredients, imageFile) {
    try {
      const formData = new FormData();
      
      if (productName) {
        formData.append('product_name', productName);
      }
      if (ingredients) {
        formData.append('ingredients', ingredients);
      }
      if (imageFile) {
        formData.append('product_image', {
          uri: imageFile.uri,
          type: imageFile.mimeType || 'image/jpeg',
          name: imageFile.fileName || 'product_image.jpg',
        });
      }

      const response = await fetch(`${this.baseURL}/skin/analyze-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      return data; // Return the direct response from /analyze-product
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getMyAnalyses(skip = 0, limit = 10) {
    try {
      return await this.makeRequest(
        `/skin/analyses?skip=${skip}&limit=${limit}`
      );
    } catch (error) {
      console.error("Get analyses error:", error);
      throw error;
    }
  }

  async deleteAnalysis(analysisId) {
    try {
      return await this.makeRequest(`/skin/analyses/${analysisId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete analysis error:', error);
      throw error;
    }
  }

  async deleteAllAnalyses() {
    try {
      return await this.makeRequest('/skin/analyses', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete all analyses error:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.makeRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.makeRequest("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      return response;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // Chat endpoints
  async createChatSession(title = null) {
    try {
      return await this.makeRequest("/chat/sessions", {
        method: "POST",
        body: JSON.stringify({
          title: title,
        }),
      });
    } catch (error) {
      console.error("Create chat session error:", error);
      throw error;
    }
  }

  async getChatSessions(skip = 0, limit = 20) {
    try {
      return await this.makeRequest(
        `/chat/sessions?skip=${skip}&limit=${limit}`
      );
    } catch (error) {
      console.error("Get chat sessions error:", error);
      throw error;
    }
  }

  async getChatSession(sessionId) {
    try {
      return await this.makeRequest(`/chat/sessions/${sessionId}`);
    } catch (error) {
      console.error("Get chat session error:", error);
      throw error;
    }
  }

  async sendChatMessage(sessionId, message) {
    try {
      return await this.makeRequest(`/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: message,
        }),
      });
    } catch (error) {
      console.error("Send chat message error:", error);
      throw error;
    }
  }

  async deleteChatSession(sessionId) {
    try {
      return await this.makeRequest(`/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete chat session error:", error);
      throw error;
    }
  }

  // ============= SKIN MEMORY ENDPOINTS =============

  async getSkinMemorySummary() {
    try {
      return await this.makeRequest('/skin-memory/summary');
    } catch (error) {
      console.error('Get skin memory summary error:', error);
      throw error;
    }
  }

  // Allergen Methods
  async getUserAllergens() {
    try {
      return await this.makeRequest('/skin-memory/allergens');
    } catch (error) {
      console.error('Get user allergens error:', error);
      throw error;
    }
  }

  async addAllergen(allergenData) {
    try {
      return await this.makeRequest('/skin-memory/allergens', {
        method: 'POST',
        body: JSON.stringify(allergenData),
      });
    } catch (error) {
      console.error('Add allergen error:', error);
      throw error;
    }
  }

  async updateAllergen(allergenId, allergenData) {
    try {
      return await this.makeRequest(`/skin-memory/allergens/${allergenId}`, {
        method: 'PUT',
        body: JSON.stringify(allergenData),
      });
    } catch (error) {
      console.error('Update allergen error:', error);
      throw error;
    }
  }

  async removeAllergen(allergenId) {
    try {
      return await this.makeRequest(`/skin-memory/allergens/${allergenId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Remove allergen error:', error);
      throw error;
    }
  }

  // Skin Issues Methods
  async getSkinIssues() {
    try {
      return await this.makeRequest('/skin-memory/issues');
    } catch (error) {
      console.error('Get skin issues error:', error);
      throw error;
    }
  }

  async addSkinIssue(issueData) {
    try {
      return await this.makeRequest('/skin-memory/issues', {
        method: 'POST',
        body: JSON.stringify(issueData),
      });
    } catch (error) {
      console.error('Add skin issue error:', error);
      throw error;
    }
  }

  async updateSkinIssue(issueId, issueData) {
    try {
      return await this.makeRequest(`/skin-memory/issues/${issueId}`, {
        method: 'PUT',
        body: JSON.stringify(issueData),
      });
    } catch (error) {
      console.error('Update skin issue error:', error);
      throw error;
    }
  }

  async deleteSkinIssue(issueId) {
    try {
      return await this.makeRequest(`/skin-memory/issues/${issueId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete skin issue error:', error);
      throw error;
    }
  }

  // Memory Methods
  async getMemories(entryType = null, limit = 50) {
    try {
      let endpoint = `/skin-memory/memories?limit=${limit}`;
      if (entryType) {
        endpoint += `&entry_type=${entryType}`;
      }
      
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Get memories error:', error);
      throw error;
    }
  }

  // Reporting Methods
  async reportReaction(reactionData) {
    try {
      return await this.makeRequest('/skin-memory/report/reaction', {
        method: 'POST',
        body: JSON.stringify(reactionData),
      });
    } catch (error) {
      console.error('Report reaction error:', error);
      throw error;
    }
  }

  async reportIssue(issueData) {
    try {
      return await this.makeRequest('/skin-memory/report/issue', {
        method: 'POST',
        body: JSON.stringify(issueData),
      });
    } catch (error) {
      console.error('Report issue error:', error);
      throw error;
    }
  }

  async deleteMemoryEntry(memoryId) {
    try {
      return await this.makeRequest(`/skin-memory/memories/${memoryId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete memory error:', error);
      throw error;
    }
  }

  async deleteAllMemories(entryType = null) {
    try {
      const url = entryType 
        ? `/skin-memory/memories?entry_type=${entryType}`
        : '/skin-memory/memories';
      return await this.makeRequest(url, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete all memories error:', error);
      throw error;
    }
  }

  async updateIssueStatus(issueId, status) {
    try {
      return await this.makeRequest(`/skin-memory/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Update issue status error:', error);
      throw error;
    }
  }
}

// Export single instance
export default new ApiService();
export { ApiService };
