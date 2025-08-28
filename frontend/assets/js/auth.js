/**
 * Authentication Manager
 * Handles login, registration, and authentication state
 */

class AuthManager {
  constructor() {
    this.api = window.api;
    this.initEventListeners();
  }

  static initLogin() {
    const authManager = new AuthManager();
    authManager.setupLoginForm();
  }

  static initRegister() {
    const authManager = new AuthManager();
    authManager.setupRegisterForm();
  }

  initEventListeners() {
    // Check authentication on page load
    this.checkAuthentication();
    
    // Handle logout clicks
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-nav' || e.target.closest('#logout-nav')) {
        e.preventDefault();
        this.logout();
      }
    });
  }

  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const passwordToggle = document.getElementById('password-toggle');
    const demoBtn = document.getElementById('demo-btn');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => this.togglePassword('password'));
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.handleDemoLogin());
    }

    // Auto-fill demo credentials
    this.setupDemoCredentials();
  }

  setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const nextStepBtn = document.getElementById('next-step-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const passwordToggle = document.getElementById('password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', () => this.nextStep());
    }

    if (prevStepBtn) {
      prevStepBtn.addEventListener('click', () => this.prevStep());
    }

    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => this.togglePassword('password'));
    }

    if (confirmPasswordToggle) {
      confirmPasswordToggle.addEventListener('click', () => this.togglePassword('confirm-password'));
    }

    // Real-time validation
    this.setupFormValidation();
  }

  async handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const loginBtn = document.getElementById('login-btn');
    
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    // Validate input
    if (!this.validateLoginForm(credentials)) {
      return;
    }

    // Show loading state
    this.setButtonLoading(loginBtn, true);
    this.hideAlert('error');

    try {
      const response = await this.api.login(credentials);
      
      if (response.success) {
        this.showAlert('success', 'Đăng nhập thành công! Đang chuyển hướng...');
        
        // Remember me functionality
        if (formData.get('remember')) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      this.showAlert('error', error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      this.setButtonLoading(loginBtn, false);
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const registerBtn = document.getElementById('register-btn');
    
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      full_name: formData.get('full_name') || null,
      age: formData.get('age') ? parseInt(formData.get('age')) : null,
      gender: formData.get('gender') || null,
      height: formData.get('height') ? parseFloat(formData.get('height')) : null,
      weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
      activity_level: formData.get('activity_level') || 'moderate'
    };

    // Validate input
    if (!this.validateRegisterForm(userData, formData.get('confirm_password'))) {
      return;
    }

    // Show loading state
    this.setButtonLoading(registerBtn, true);
    this.hideAlert('error');

    try {
      const response = await this.api.register(userData);
      
      if (response.success) {
        this.showAlert('success', 'Đăng ký thành công! Đang chuyển hướng...');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error) {
      this.showAlert('error', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      this.setButtonLoading(registerBtn, false);
    }
  }

  async handleDemoLogin() {
    const demoCredentials = {
      username: 'demo',
      password: 'demo123'
    };

    // Fill form with demo credentials
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    if (usernameField) usernameField.value = demoCredentials.username;
    if (passwordField) passwordField.value = demoCredentials.password;

    // Submit the form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      loginForm.dispatchEvent(submitEvent);
    }
  }

  validateLoginForm(credentials) {
    let isValid = true;

    // Clear previous errors
    this.clearFormErrors();

    // Validate username
    if (!credentials.username || credentials.username.trim().length < 3) {
      this.showFieldError('username', 'Tên đăng nhập phải có ít nhất 3 ký tự');
      isValid = false;
    }

    // Validate password
    if (!credentials.password || credentials.password.length < 6) {
      this.showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  }

  validateRegisterForm(userData, confirmPassword) {
    let isValid = true;

    // Clear previous errors
    this.clearFormErrors();

    // Validate username
    if (!userData.username || userData.username.length < 3) {
      this.showFieldError('username', 'Tên đăng nhập phải có ít nhất 3 ký tự');
      isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(userData.username)) {
      this.showFieldError('username', 'Tên đăng nhập chỉ chứa chữ cái và số');
      isValid = false;
    }

    // Validate email
    if (!userData.email || !this.isValidEmail(userData.email)) {
      this.showFieldError('email', 'Email không hợp lệ');
      isValid = false;
    }

    // Validate password
    if (!userData.password || userData.password.length < 6) {
      this.showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    // Validate confirm password
    if (userData.password !== confirmPassword) {
      this.showFieldError('confirm-password', 'Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    // Validate optional fields
    if (userData.age && (userData.age < 10 || userData.age > 120)) {
      this.showFieldError('age', 'Tuổi phải từ 10 đến 120');
      isValid = false;
    }

    if (userData.height && (userData.height < 50 || userData.height > 300)) {
      this.showFieldError('height', 'Chiều cao phải từ 50cm đến 300cm');
      isValid = false;
    }

    if (userData.weight && (userData.weight < 20 || userData.weight > 500)) {
      this.showFieldError('weight', 'Cân nặng phải từ 20kg đến 500kg');
      isValid = false;
    }

    return isValid;
  }

  setupFormValidation() {
    // Real-time validation for registration form
    const inputs = ['username', 'email', 'password', 'confirm-password'];
    
    inputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('blur', () => this.validateField(inputId));
        input.addEventListener('input', () => this.clearFieldError(inputId));
      }
    });

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
    }
  }

  validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;

    const value = input.value.trim();
    let isValid = true;
    let message = '';

    switch (fieldId) {
      case 'username':
        if (value.length < 3) {
          message = 'Tên đăng nhập phải có ít nhất 3 ký tự';
          isValid = false;
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          message = 'Tên đăng nhập chỉ chứa chữ cái và số';
          isValid = false;
        }
        break;
      
      case 'email':
        if (!this.isValidEmail(value)) {
          message = 'Email không hợp lệ';
          isValid = false;
        }
        break;
      
      case 'password':
        if (value.length < 6) {
          message = 'Mật khẩu phải có ít nhất 6 ký tự';
          isValid = false;
        }
        break;
      
      case 'confirm-password':
        const passwordInput = document.getElementById('password');
        if (passwordInput && value !== passwordInput.value) {
          message = 'Mật khẩu xác nhận không khớp';
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(fieldId, message);
    } else {
      this.clearFieldError(fieldId);
    }

    return isValid;
  }

  updatePasswordStrength(password) {
    // This is a placeholder for password strength indicator
    // Can be enhanced with actual strength calculation
    console.log('Password strength:', password.length);
  }

  nextStep() {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    // Validate step 1 fields
    const requiredFields = ['username', 'email', 'password', 'confirm-password'];
    let isValid = true;
    
    for (const fieldId of requiredFields) {
      if (!this.validateField(fieldId)) {
        isValid = false;
      }
    }

    if (isValid) {
      step1.classList.remove('active');
      step2.classList.add('active');
    }
  }

  prevStep() {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    step2.classList.remove('active');
    step1.classList.add('active');
  }

  togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const toggleBtn = document.getElementById(`${fieldId}-toggle`);
    
    if (passwordField && toggleBtn) {
      const isPassword = passwordField.type === 'password';
      passwordField.type = isPassword ? 'text' : 'password';
      
      const showIcon = toggleBtn.querySelector('.show-password');
      const hideIcon = toggleBtn.querySelector('.hide-password');
      
      if (showIcon && hideIcon) {
        showIcon.style.display = isPassword ? 'none' : 'inline';
        hideIcon.style.display = isPassword ? 'inline' : 'none';
      }
    }
  }

  setupDemoCredentials() {
    // Add tooltip or help text for demo
    const usernameField = document.getElementById('username');
    if (usernameField) {
      usernameField.placeholder = 'Nhập tên đăng nhập (demo: demo)';
    }
  }

  async checkAuthentication() {
    // Skip auth check on auth pages
    const authPages = ['/login', '/register', '/'];
    if (authPages.includes(window.location.pathname)) {
      return;
    }

    if (!this.api.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    try {
      await this.api.verifyToken();
    } catch (error) {
      console.error('Token verification failed:', error);
      this.logout();
    }
  }

  logout() {
    this.api.logout();
  }

  // Utility methods
  showAlert(type, message) {
    const alertId = type === 'error' ? 'error-alert' : 'success-alert';
    const messageId = type === 'error' ? 'error-message' : 'success-message';
    
    const alert = document.getElementById(alertId);
    const messageElement = document.getElementById(messageId);
    
    if (alert && messageElement) {
      messageElement.textContent = message;
      alert.style.display = 'block';
      alert.classList.add('show');
      
      // Auto-hide success messages
      if (type === 'success') {
        setTimeout(() => {
          alert.style.display = 'none';
          alert.classList.remove('show');
        }, 3000);
      }
    }
  }

  hideAlert(type) {
    const alertId = type === 'error' ? 'error-alert' : 'success-alert';
    const alert = document.getElementById(alertId);
    
    if (alert) {
      alert.style.display = 'none';
      alert.classList.remove('show');
    }
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    if (field) {
      field.parentElement.classList.add('error');
    }
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    if (field) {
      field.parentElement.classList.remove('error');
    }
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const formGroups = document.querySelectorAll('.form-group');
    
    errorElements.forEach(element => {
      element.textContent = '';
      element.classList.remove('show');
    });
    
    formGroups.forEach(group => {
      group.classList.remove('error');
    });
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

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Make AuthManager available globally
window.AuthManager = AuthManager;