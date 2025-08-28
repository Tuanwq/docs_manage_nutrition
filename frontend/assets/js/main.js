/**
 * Main Application JavaScript
 * Handles dashboard, foods management, and general UI interactions
 */

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize based on current page
  const currentPage = window.location.pathname;
  
  if (currentPage === '/') {
    initLandingPage();
  } else if (currentPage === '/dashboard') {
    initDashboard();
  } else if (currentPage === '/foods') {
    initFoodsPage();
  }
  
  // Initialize common components
  initCommonComponents();
});

/**
 * Landing Page Initialization
 */
function initLandingPage() {
  // Update current date
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    const today = new Date();
    currentDateElement.textContent = today.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Mobile navigation toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }
}

/**
 * Dashboard Manager
 */
class DashboardManager {
  constructor() {
    this.api = window.api;
    this.currentDate = new Date();
    this.selectedFood = null;
    this.currentMealType = 'breakfast';
    
    this.init();
  }

  static init() {
    new DashboardManager();
  }

  init() {
    this.initializeDateSelector();
    this.initializeSidebar();
    this.initializeModals();
    this.initializeEventListeners();
    this.loadUserProfile();
    this.loadDashboardData();
  }

  initializeDateSelector() {
    const dateSelector = document.getElementById('date-selector');
    if (dateSelector) {
      dateSelector.value = this.formatDate(this.currentDate);
      dateSelector.addEventListener('change', (e) => {
        this.currentDate = new Date(e.target.value);
        this.loadDashboardData();
      });
    }
  }

  initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    [sidebarToggle, mobileMenuBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          sidebar.classList.toggle('show');
        });
      }
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
          sidebar.classList.remove('show');
        }
      }
    });
  }

  initializeModals() {
    const addMealModal = document.getElementById('add-meal-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelAddMeal = document.getElementById('cancel-add-meal');

    // Open modal event listeners
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-food-btn') || e.target.id === 'add-meal-btn') {
        e.preventDefault();
        const mealType = e.target.dataset.mealType || 'breakfast';
        this.openAddMealModal(mealType);
      }
    });

    // Close modal event listeners
    [closeModal, cancelAddMeal].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.closeAddMealModal();
        });
      }
    });

    // Close modal on backdrop click
    if (addMealModal) {
      addMealModal.addEventListener('click', (e) => {
        if (e.target === addMealModal) {
          this.closeAddMealModal();
        }
      });
    }
  }

  initializeEventListeners() {
    // Food search
    const foodSearch = document.getElementById('food-search');
    if (foodSearch) {
      let searchTimeout;
      foodSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchFoods(e.target.value);
        }, 300);
      });
    }

    // Quantity input for nutrition preview
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
      quantityInput.addEventListener('input', () => {
        this.updateNutritionPreview();
      });
    }

    // Add meal form
    const addMealForm = document.getElementById('add-meal-form');
    if (addMealForm) {
      addMealForm.addEventListener('submit', (e) => {
        this.handleAddMeal(e);
      });
    }

    // Clear food selection
    const clearSelection = document.getElementById('clear-selection');
    if (clearSelection) {
      clearSelection.addEventListener('click', () => {
        this.clearFoodSelection();
      });
    }

    // Profile and settings navigation
    const profileNav = document.getElementById('profile-nav');
    if (profileNav) {
      profileNav.addEventListener('click', (e) => {
        e.preventDefault();
        this.openProfileModal();
      });
    }
  }

  async loadUserProfile() {
    try {
      const response = await this.api.getProfile();
      if (response.success) {
        const user = response.data;
        
        // Update user name in header
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
          userNameElement.textContent = user.full_name || user.username;
        }

        // Update user avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
          userAvatar.textContent = (user.full_name || user.username).charAt(0).toUpperCase();
        }

        // Update calorie target if available
        if (user.daily_calories) {
          const caloriesTarget = document.getElementById('calories-target');
          if (caloriesTarget) {
            caloriesTarget.textContent = user.daily_calories;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  async loadDashboardData() {
    this.showLoading(true);
    
    try {
      // Load daily nutrition summary
      const nutritionResponse = await this.api.getDailyNutrition(this.currentDate);
      if (nutritionResponse.success) {
        this.updateNutritionStats(nutritionResponse.data);
        this.updateMealCards(nutritionResponse.data.nutrition);
      }

      // Load recent activity (mock for now)
      this.loadRecentActivity();
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.api.handleError(error);
    } finally {
      this.showLoading(false);
    }
  }

  updateNutritionStats(data) {
    const { nutrition, goals } = data;
    const total = nutrition.total;

    // Update calorie stats
    this.updateStatCard('calories', total.calories, goals.calories);
    this.updateStatCard('protein', total.protein, goals.protein, 'g');
    this.updateStatCard('carbs', total.carbs, goals.carbs, 'g');
    this.updateStatCard('fat', total.fat, goals.fat, 'g');
  }

  updateStatCard(type, consumed, target, unit = '') {
    const consumedElement = document.getElementById(`${type}-consumed`);
    const targetElement = document.getElementById(`${type}-target`);
    const progressElement = document.getElementById(`${type}-progress`);

    if (consumedElement) {
      consumedElement.textContent = consumed + unit;
    }

    if (targetElement && target) {
      targetElement.textContent = target + unit;
    }

    if (progressElement && target) {
      const percentage = Math.min((consumed / target) * 100, 100);
      progressElement.style.width = `${percentage}%`;
    }
  }

  updateMealCards(nutrition) {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    mealTypes.forEach(mealType => {
      const mealData = nutrition[mealType];
      const caloriesElement = document.getElementById(`${mealType}-calories`);
      const foodsContainer = document.getElementById(`${mealType}-foods`);

      if (caloriesElement) {
        caloriesElement.textContent = mealData.calories;
      }

      if (foodsContainer) {
        if (mealData.foods.length === 0) {
          foodsContainer.innerHTML = `
            <div class="empty-meal">
              <p>Chưa có món ăn nào</p>
              <button class="btn btn-outline btn-small add-food-btn" data-meal-type="${mealType}">
                + Thêm món ăn
              </button>
            </div>
          `;
        } else {
          foodsContainer.innerHTML = mealData.foods.map(item => 
            this.createFoodItemHTML(item)
          ).join('');
        }
      }
    });
  }

  createFoodItemHTML(item) {
    return `
      <div class="food-item" data-meal-id="${item.id}">
        <div class="food-info">
          <h4>${item.food.name}</h4>
          <div class="food-details">
            ${item.quantity}g - ${item.nutrition.calories} calories
          </div>
        </div>
        <div class="food-actions">
          <button class="icon-btn edit" onclick="editMeal(${item.id})">✏️</button>
          <button class="icon-btn delete" onclick="deleteMeal(${item.id})">🗑️</button>
        </div>
      </div>
    `;
  }

  openAddMealModal(mealType = 'breakfast') {
    this.currentMealType = mealType;
    const modal = document.getElementById('add-meal-modal');
    const mealTypeSelect = document.getElementById('meal-type');
    
    if (mealTypeSelect) {
      mealTypeSelect.value = mealType;
    }

    if (modal) {
      modal.classList.add('show');
    }

    // Reset form
    this.resetAddMealForm();
  }

  closeAddMealModal() {
    const modal = document.getElementById('add-meal-modal');
    if (modal) {
      modal.classList.remove('show');
    }
    this.resetAddMealForm();
  }

  resetAddMealForm() {
    const form = document.getElementById('add-meal-form');
    if (form) {
      form.reset();
    }
    
    this.clearFoodSelection();
    this.hideNutritionPreview();
    this.hideSearchResults();
  }

  async searchFoods(query) {
    if (!query || query.length < 2) {
      this.hideSearchResults();
      return;
    }

    try {
      const response = await this.api.searchFoods(query, 10);
      if (response.success) {
        this.displaySearchResults(response.data.foods);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  displaySearchResults(foods) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (foods.length === 0) {
      resultsContainer.innerHTML = '<div class="search-result-item">Không tìm thấy thực phẩm nào</div>';
    } else {
      resultsContainer.innerHTML = foods.map(food => `
        <div class="search-result-item" data-food-id="${food.id}">
          <div class="result-name">${food.name}</div>
          <div class="result-details">
            ${food.calories_per_100g} calories/100g
            ${food.brand ? `- ${food.brand}` : ''}
          </div>
        </div>
      `).join('');

      // Add click listeners
      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const foodId = item.dataset.foodId;
          const food = foods.find(f => f.id == foodId);
          this.selectFood(food);
        });
      });
    }

    resultsContainer.classList.add('show');
  }

  hideSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.classList.remove('show');
    }
  }

  selectFood(food) {
    this.selectedFood = food;
    
    // Update selected food display
    const selectedFoodDiv = document.getElementById('selected-food');
    const foodNameElement = document.getElementById('selected-food-name');
    const foodCaloriesElement = document.getElementById('selected-food-calories');
    
    if (selectedFoodDiv && foodNameElement && foodCaloriesElement) {
      foodNameElement.textContent = food.name;
      foodCaloriesElement.textContent = `${food.calories_per_100g} calories / 100g`;
      selectedFoodDiv.style.display = 'block';
    }

    // Clear search
    const searchInput = document.getElementById('food-search');
    if (searchInput) {
      searchInput.value = food.name;
    }
    
    this.hideSearchResults();
    this.updateNutritionPreview();
  }

  clearFoodSelection() {
    this.selectedFood = null;
    
    const selectedFoodDiv = document.getElementById('selected-food');
    if (selectedFoodDiv) {
      selectedFoodDiv.style.display = 'none';
    }

    const searchInput = document.getElementById('food-search');
    if (searchInput) {
      searchInput.value = '';
    }

    this.hideNutritionPreview();
  }

  updateNutritionPreview() {
    const quantityInput = document.getElementById('quantity');
    const previewDiv = document.getElementById('nutrition-preview');
    
    if (!this.selectedFood || !quantityInput || !previewDiv) return;

    const quantity = parseFloat(quantityInput.value);
    if (!quantity || quantity <= 0) {
      this.hideNutritionPreview();
      return;
    }

    const nutrition = this.api.formatNutrition(this.selectedFood, quantity);
    
    // Update preview values
    document.getElementById('preview-calories').textContent = nutrition.calories;
    document.getElementById('preview-protein').textContent = nutrition.protein + 'g';
    document.getElementById('preview-carbs').textContent = nutrition.carbs + 'g';
    document.getElementById('preview-fat').textContent = nutrition.fat + 'g';
    
    previewDiv.style.display = 'block';
  }

  hideNutritionPreview() {
    const previewDiv = document.getElementById('nutrition-preview');
    if (previewDiv) {
      previewDiv.style.display = 'none';
    }
  }

  async handleAddMeal(event) {
    event.preventDefault();
    
    if (!this.selectedFood) {
      alert('Vui lòng chọn thực phẩm');
      return;
    }

    const formData = new FormData(event.target);
    const mealData = {
      food_id: this.selectedFood.id,
      quantity: parseFloat(formData.get('quantity')),
      meal_type: formData.get('meal_type')
    };

    if (!mealData.quantity || mealData.quantity <= 0) {
      alert('Vui lòng nhập khối lượng hợp lệ');
      return;
    }

    const saveBtn = document.getElementById('save-meal-btn');
    this.setButtonLoading(saveBtn, true);

    try {
      const response = await this.api.addMeal(mealData);
      if (response.success) {
        this.closeAddMealModal();
        this.loadDashboardData(); // Refresh data
        this.api.showSuccessAlert('Đã thêm món ăn thành công');
      }
    } catch (error) {
      this.api.handleError(error);
    } finally {
      this.setButtonLoading(saveBtn, false);
    }
  }

  loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;

    // Mock recent activity data
    const activities = [
      {
        icon: '🍎',
        text: 'Thêm Táo vào bữa sáng',
        time: '2 giờ trước'
      },
      {
        icon: '🥗',
        text: 'Hoàn thành mục tiêu protein',
        time: '5 giờ trước'
      },
      {
        icon: '📊',
        text: 'Đạt 80% mục tiêu calories',
        time: '1 ngày trước'
      }
    ];

    activityList.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-info">
          <p>${activity.text}</p>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }

  showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      if (show) {
        loadingOverlay.classList.add('show');
      } else {
        loadingOverlay.classList.remove('show');
      }
    }
  }

  setButtonLoading(button, loading) {
    if (!button) return;
    
    const textElement = button.querySelector('.btn-text');
    const loadingElement = button.querySelector('.btn-loading');
    
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
      if (textElement) textElement.style.display = 'none';
      if (loadingElement) loadingElement.style.display = 'flex';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      if (textElement) textElement.style.display = 'inline';
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  openProfileModal() {
    // Placeholder for profile modal
    alert('Profile modal coming soon!');
  }
}

/**
 * Foods Manager
 */
class FoodsManager {
  constructor() {
    this.api = window.api;
    this.currentPage = 1;
    this.currentView = 'grid';
    this.currentFilters = {};
    this.foods = [];
    
    this.init();
  }

  static init() {
    new FoodsManager();
  }

  init() {
    this.initializeSidebar();
    this.initializeEventListeners();
    this.loadCategories();
    this.loadFoods();
  }

  initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    [sidebarToggle, mobileMenuBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          sidebar.classList.toggle('show');
        });
      }
    });
  }

  initializeEventListeners() {
    // Search
    const searchInput = document.getElementById('food-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentFilters.search = e.target.value;
          this.loadFoods();
        }, 500);
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.loadFoods();
      });
    }

    // Filters
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const clearFilters = document.getElementById('clear-filters');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value;
        this.loadFoods();
      });
    }

    if (sortBy) {
      sortBy.addEventListener('change', (e) => {
        this.currentFilters.sort_by = e.target.value;
        this.loadFoods();
      });
    }

    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // View controls
    const gridView = document.getElementById('grid-view');
    const listView = document.getElementById('list-view');

    if (gridView) {
      gridView.addEventListener('click', () => {
        this.setView('grid');
      });
    }

    if (listView) {
      listView.addEventListener('click', () => {
        this.setView('list');
      });
    }

    // Add food button
    const addFoodBtn = document.getElementById('add-food-btn');
    if (addFoodBtn) {
      addFoodBtn.addEventListener('click', () => {
        this.openFoodModal();
      });
    }

    // Pagination
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');

    if (prevPage) {
      prevPage.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadFoods();
        }
      });
    }

    if (nextPage) {
      nextPage.addEventListener('click', () => {
        this.currentPage++;
        this.loadFoods();
      });
    }
  }

  async loadCategories() {
    try {
      const response = await this.api.getCategories();
      if (response.success) {
        this.updateCategoryCounts(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  updateCategoryCounts(categories) {
    categories.forEach(category => {
      const countElement = document.querySelector(`[data-category="${category.value}"] .category-count`);
      if (countElement) {
        // This would normally come from the API
        countElement.textContent = '0 thực phẩm';
      }
    });
  }

  async loadFoods() {
    this.showLoading(true);
    
    try {
      const params = {
        page: this.currentPage,
        limit: 20,
        ...this.currentFilters
      };

      const response = await this.api.getFoods(params);
      if (response.success) {
        this.foods = response.data.foods;
        this.displayFoods(this.foods);
        this.updatePagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load foods:', error);
      this.showEmptyState();
    } finally {
      this.showLoading(false);
    }
  }

  displayFoods(foods) {
    if (foods.length === 0) {
      this.showEmptyState();
      return;
    }

    const gridContainer = document.getElementById('foods-grid');
    const listContainer = document.getElementById('foods-list');

    if (this.currentView === 'grid' && gridContainer) {
      gridContainer.innerHTML = foods.map(food => this.createFoodCardHTML(food)).join('');
      gridContainer.style.display = 'grid';
      if (listContainer) listContainer.style.display = 'none';
    } else if (this.currentView === 'list' && listContainer) {
      const tableBody = document.getElementById('foods-table-body');
      if (tableBody) {
        tableBody.innerHTML = foods.map(food => this.createFoodRowHTML(food)).join('');
      }
      listContainer.style.display = 'block';
      if (gridContainer) gridContainer.style.display = 'none';
    }

    // Hide empty state
    const emptyState = document.getElementById('foods-empty');
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }

  createFoodCardHTML(food) {
    return `
      <div class="food-card" data-food-id="${food.id}">
        <div class="food-card-header">
          <div>
            <h4 class="food-name">${food.name}</h4>
            ${food.brand ? `<div class="food-brand">${food.brand}</div>` : ''}
          </div>
          <span class="food-category">${this.getCategoryLabel(food.category)}</span>
        </div>
        <div class="nutrition-summary">
          <div class="nutrition-item">
            <span class="nutrition-label">Calories:</span>
            <span class="nutrition-value">${food.calories_per_100g}</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">Protein:</span>
            <span class="nutrition-value">${food.protein_per_100g}g</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">Carbs:</span>
            <span class="nutrition-value">${food.carbs_per_100g}g</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">Fat:</span>
            <span class="nutrition-value">${food.fat_per_100g}g</span>
          </div>
        </div>
        <div class="food-actions">
          <button class="btn btn-outline btn-small" onclick="viewFoodDetails(${food.id})">
            👁️ Xem
          </button>
          <button class="btn btn-primary btn-small" onclick="addFoodToMeal(${food.id})">
            + Thêm
          </button>
        </div>
      </div>
    `;
  }

  createFoodRowHTML(food) {
    return `
      <div class="table-row" data-food-id="${food.id}">
        <div class="col-name">
          <strong>${food.name}</strong>
          ${food.brand ? `<br><small>${food.brand}</small>` : ''}
        </div>
        <div class="col-category">${this.getCategoryLabel(food.category)}</div>
        <div class="col-calories">${food.calories_per_100g}</div>
        <div class="col-protein">${food.protein_per_100g}g</div>
        <div class="col-carbs">${food.carbs_per_100g}g</div>
        <div class="col-fat">${food.fat_per_100g}g</div>
        <div class="col-actions">
          <button class="icon-btn" onclick="viewFoodDetails(${food.id})">👁️</button>
          <button class="icon-btn" onclick="editFood(${food.id})">✏️</button>
          <button class="icon-btn delete" onclick="deleteFood(${food.id})">🗑️</button>
        </div>
      </div>
    `;
  }

  getCategoryLabel(category) {
    const categoryMap = {
      grains: 'Ngũ cốc',
      protein: 'Protein',
      vegetables: 'Rau củ',
      fruits: 'Trái cây',
      dairy: 'Sữa',
      beverages: 'Đồ uống',
      snacks: 'Ăn vặt',
      other: 'Khác'
    };
    return categoryMap[category] || category;
  }

  setView(view) {
    this.currentView = view;
    
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    
    if (gridBtn && listBtn) {
      gridBtn.classList.toggle('active', view === 'grid');
      listBtn.classList.toggle('active', view === 'list');
    }
    
    this.displayFoods(this.foods);
  }

  clearFilters() {
    this.currentFilters = {};
    this.currentPage = 1;
    
    // Clear filter inputs
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const searchInput = document.getElementById('food-search');
    
    if (categoryFilter) categoryFilter.value = '';
    if (sortBy) sortBy.value = 'name';
    if (searchInput) searchInput.value = '';
    
    this.loadFoods();
  }

  showLoading(show) {
    const loadingState = document.getElementById('foods-loading');
    const gridContainer = document.getElementById('foods-grid');
    const listContainer = document.getElementById('foods-list');
    
    if (loadingState) {
      loadingState.style.display = show ? 'block' : 'none';
    }
    
    if (gridContainer) {
      gridContainer.style.display = show ? 'none' : 'grid';
    }
    
    if (listContainer) {
      listContainer.style.display = show ? 'none' : 'block';
    }
  }

  showEmptyState() {
    const emptyState = document.getElementById('foods-empty');
    const gridContainer = document.getElementById('foods-grid');
    const listContainer = document.getElementById('foods-list');
    
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    
    if (gridContainer) {
      gridContainer.style.display = 'none';
    }
    
    if (listContainer) {
      listContainer.style.display = 'none';
    }
  }

  updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    const paginationText = document.getElementById('pagination-text');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (paginationContainer && pagination.total_pages > 1) {
      paginationContainer.style.display = 'flex';
      
      if (paginationText) {
        paginationText.textContent = `Trang ${pagination.current_page} / ${pagination.total_pages}`;
      }
      
      if (prevBtn) {
        prevBtn.disabled = pagination.current_page <= 1;
      }
      
      if (nextBtn) {
        nextBtn.disabled = pagination.current_page >= pagination.total_pages;
      }
    } else if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
  }

  openFoodModal(food = null) {
    // Placeholder for food modal
    alert('Food modal coming soon!');
  }
}

/**
 * Common Components Initialization
 */
function initCommonComponents() {
  // Initialize tooltips, dropdowns, etc.
  initAuthCheck();
}

function initAuthCheck() {
  // Check if user is authenticated on protected pages
  const protectedPages = ['/dashboard', '/foods'];
  const currentPage = window.location.pathname;
  
  if (protectedPages.includes(currentPage)) {
    if (!window.api.isAuthenticated()) {
      window.location.href = '/login';
    }
  }
}

/**
 * Initialize Dashboard
 */
function initDashboard() {
  // Will be called by DashboardManager.init()
}

/**
 * Initialize Foods Page
 */
function initFoodsPage() {
  // Will be called by FoodsManager.init()
}

// Global functions for button actions
window.editMeal = function(mealId) {
  console.log('Edit meal:', mealId);
  // Implement meal editing
};

window.deleteMeal = async function(mealId) {
  if (confirm('Bạn có chắc muốn xóa món ăn này?')) {
    try {
      await window.api.deleteMeal(mealId);
      window.location.reload(); // Refresh page
    } catch (error) {
      alert('Không thể xóa món ăn');
    }
  }
};

window.viewFoodDetails = function(foodId) {
  console.log('View food details:', foodId);
  // Implement food details modal
};

window.editFood = function(foodId) {
  console.log('Edit food:', foodId);
  // Implement food editing
};

window.deleteFood = async function(foodId) {
  if (confirm('Bạn có chắc muốn xóa thực phẩm này?')) {
    try {
      await window.api.deleteFood(foodId);
      window.location.reload(); // Refresh page
    } catch (error) {
      alert('Không thể xóa thực phẩm');
    }
  }
};

window.addFoodToMeal = function(foodId) {
  console.log('Add food to meal:', foodId);
  // Implement add to meal functionality
};

// Make managers available globally
window.DashboardManager = DashboardManager;
window.FoodsManager = FoodsManager;