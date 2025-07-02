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
      return await AsyncStorage.getItem("auth_token");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("auth_token");
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
      timeout: 10000, // 10 second timeout
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

  async analyzeProduct(
    productName = null,
    ingredients = null,
    productImage = null
  ) {
    try {
      console.log("=== PRODUCT ANALYSIS START ===");
      console.log("Product name:", productName);
      console.log("Ingredients:", ingredients);
      console.log("Has image:", !!productImage);

      if (productImage) {
        console.log("Image details:", {
          uri: productImage.uri,
          type: productImage.type,
          name: productImage.fileName || productImage.name,
          size: productImage.fileSize || productImage.size,
        });

        // For React Native, we need to use a different approach
        const formData = new FormData();

        if (productName) {
          formData.append("product_name", productName);
        }

        if (ingredients) {
          formData.append("ingredients", ingredients);
        }

        // Fix the image upload format for React Native
        const imageFile = {
          uri: productImage.uri,
          type:
            productImage.type === "image"
              ? "image/jpeg"
              : productImage.type || "image/jpeg",
          name:
            productImage.fileName || productImage.name || "product_image.jpg",
        };

        formData.append("product_image", imageFile);

        const token = await this.getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log(
          "Making request to:",
          `${this.baseURL}/skin/analyze-product`
        );
        console.log("Image file object:", imageFile);

        const response = await fetch(`${this.baseURL}/skin/analyze-product`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            // Don't set Content-Type for FormData with files
          },
          body: formData,
        });

        console.log("Response status:", response.status);

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            console.error("Error parsing error response:", e);
            throw new Error(`HTTP ${response.status}: ${responseText}`);
          }

          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          );
        }

        let result;
        try {
          result = JSON.parse(responseText);
          console.log("Parsed result:", result);
        } catch (e) {
          console.error("Error parsing success response:", e);
          throw new Error("Invalid response format from server");
        }

        console.log("=== PRODUCT ANALYSIS SUCCESS ===");
        return result;
      } else {
        // Text-based analysis using the existing makeRequest method
        return await this.makeRequest("/skin/analyze-product", {
          method: "POST",
          body: JSON.stringify({
            product_name: productName,
            ingredients: ingredients,
          }),
        });
      }
    } catch (error) {
      console.error("=== PRODUCT ANALYSIS ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      // Handle specific error types
      if (error.message.includes("Network request failed")) {
        throw new Error(
          "Network connection failed. Please check your internet connection and ensure the backend server is running."
        );
      }

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
}

export default new ApiService();
export { ApiService };
