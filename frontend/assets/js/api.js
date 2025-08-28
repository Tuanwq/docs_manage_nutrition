/**
 * API Client for Nutrition Management System
 * Handles all HTTP requests to the backend API
 */

class NutritionAPI {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  // Authentication Methods
  async login(credentials) {
    const response = await this.post('/auth/login', credentials, { auth: false });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData, { auth: false });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async verifyToken() {
    return this.get('/auth/verify');
  }

  logout() {
    this.setToken(null);
    window.location.href = '/login';
  }

  // User Methods
  async updateProfile(userData) {
    return this.put('/users/profile', userData);
  }

  async addMeal(mealData) {
    return this.post('/users/meals', mealData);
  }

  async getMealsByDate(date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return this.get(`/users/meals?date=${dateStr}`);
  }

  async getDailyNutrition(date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return this.get(`/users/nutrition?date=${dateStr}`);
  }

  async updateMeal(mealId, mealData) {
    return this.put(`/users/meals/${mealId}`, mealData);
  }

  async deleteMeal(mealId) {
    return this.delete(`/users/meals/${mealId}`);
  }

  async getUserStatistics(days = 7) {
    return this.get(`/users/statistics?days=${days}`);
  }

  // Food Methods
  async getFoods(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/foods?${queryString}`, { auth: false });
  }

  async getFoodById(foodId) {
    return this.get(`/foods/${foodId}`, { auth: false });
  }

  async searchFoods(searchTerm, limit = 20) {
    return this.get(`/foods/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`, { auth: false });
  }

  async getFoodsByCategory(category, limit = 50) {
    return this.get(`/foods/category/${category}?limit=${limit}`, { auth: false });
  }

  async getCategories() {
    return this.get('/foods/categories', { auth: false });
  }

  async createFood(foodData) {
    return this.post('/foods', foodData);
  }

  async updateFood(foodId, foodData) {
    return this.put(`/foods/${foodId}`, foodData);
  }

  async deleteFood(foodId) {
    return this.delete(`/foods/${foodId}`);
  }

  // Health Check
  async healthCheck() {
    return this.get('/health', { auth: false });
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Helper method to handle API errors
  handleError(error, showAlert = true) {
    console.error('API Error:', error);
    
    if (showAlert) {
      // Show error message to user
      const message = error.message || 'An error occurred. Please try again.';
      this.showErrorAlert(message);
    }

    // Handle authentication errors
    if (error.message && error.message.includes('token')) {
      this.logout();
    }
  }

  // Helper method to show error alerts
  showErrorAlert(message) {
    // Look for existing error alert
    let errorAlert = document.getElementById('error-alert');
    
    if (errorAlert) {
      const messageElement = document.getElementById('error-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
      errorAlert.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorAlert.style.display = 'none';
      }, 5000);
    } else {
      // Fallback to browser alert
      alert(message);
    }
  }

  // Helper method to show success alerts
  showSuccessAlert(message) {
    let successAlert = document.getElementById('success-alert');
    
    if (successAlert) {
      const messageElement = document.getElementById('success-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
      successAlert.style.display = 'block';
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        successAlert.style.display = 'none';
      }, 3000);
    }
  }

  // Helper method to format nutrition data
  formatNutrition(food, quantity) {
    if (!food || !quantity) return null;

    const factor = quantity / 100;
    return {
      calories: Math.round(food.calories_per_100g * factor),
      protein: Math.round(food.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(food.fat_per_100g * factor * 10) / 10,
      fiber: Math.round(food.fiber_per_100g * factor * 10) / 10,
      sugar: Math.round(food.sugar_per_100g * factor * 10) / 10,
      sodium: Math.round(food.sodium_per_100g * factor * 10) / 10
    };
  }

  // Helper method to format date for API
  formatDate(date) {
    if (!date) return new Date().toISOString().split('T')[0];
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }

  // Helper method to validate response
  validateResponse(response) {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format');
    }

    if (!response.success) {
      throw new Error(response.message || 'Request failed');
    }

    return response;
  }
}

// Create global API instance
const api = new NutritionAPI();

// Make API instance available globally
window.api = api;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NutritionAPI;
}