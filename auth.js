// Authentication form handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all forms
    initSignupForm();
    initLoginForm();
    addNotificationStyles();
});

// Add notification styles to the page
function addNotificationStyles() {
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            font-family: var(--font-primary, 'Inter', sans-serif);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        
        .notification-message {
            flex: 1;
            font-size: 0.95rem;
            line-height: 1.4;
            color: var(--text-primary);
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #64748b;
            padding: 4px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
            flex-shrink: 0;
        }
        
        .notification-close:hover {
            background-color: #f1f5f9;
        }
        
        .notification-close:focus {
            outline: 2px solid var(--electric-turquoise);
            outline-offset: 1px;
        }
        
        @media (max-width: 480px) {
            .notification {
                right: 15px !important;
                left: 15px !important;
                max-width: none !important;
                transform: translateY(-100%) !important;
                top: 80px !important;
            }
            
            .notification.show {
                transform: translateY(0) !important;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
}

// Signup Form Initialization
function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    const fields = {
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        dateOfBirth: document.getElementById('dateOfBirth'),
        gender: document.querySelectorAll('input[name="gender"]'),
        employmentStatus: document.getElementById('employmentStatus'),
        occupation: document.getElementById('occupation'),
        agreeTerms: document.getElementById('agreeTerms')
    };

    // Set max date to today for date of birth
    if (fields.dateOfBirth) {
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        fields.dateOfBirth.setAttribute('max', maxDate);
    }

    // Password toggle functionality
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const passwordField = fields.password;
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.className = 'fas fa-eye-slash';
                this.setAttribute('aria-label', 'Hide password');
            } else {
                passwordField.type = 'password';
                icon.className = 'fas fa-eye';
                this.setAttribute('aria-label', 'Show password');
            }
        });
    }

    // Employment status change handler
    if (fields.employmentStatus) {
        fields.employmentStatus.addEventListener('change', function() {
            const occupationGroup = document.getElementById('occupationGroup');
            const occupationLabel = document.getElementById('occupationLabel');
            const occupationIcon = document.getElementById('occupationIcon');
            const occupationHint = document.getElementById('occupationHint');

            if (this.value === 'student') {
                occupationGroup.style.display = 'block';
                occupationLabel.textContent = 'Field of Study';
                occupationIcon.className = 'fas fa-graduation-cap input-icon';
                occupationHint.textContent = 'What are you studying?';
                fields.occupation.placeholder = 'e.g., Psychology, Computer Science';
                fields.occupation.setAttribute('required', 'true');
            } else if (this.value === 'employed') {
                occupationGroup.style.display = 'block';
                occupationLabel.textContent = 'Occupation';
                occupationIcon.className = 'fas fa-briefcase input-icon';
                occupationHint.textContent = 'What is your job title or profession?';
                fields.occupation.placeholder = 'e.g., Software Engineer, Teacher';
                fields.occupation.setAttribute('required', 'true');
            } else {
                occupationGroup.style.display = 'none';
                fields.occupation.removeAttribute('required');
            }

            // Clear any existing validation errors when changing
            const occupationError = document.getElementById('occupation-error');
            if (occupationError) {
                occupationError.textContent = '';
            }
            fields.occupation.classList.remove('error', 'success');
        });
    }

    // Real-time validation
    if (fields.username) {
        fields.username.addEventListener('input', debounce(() => validateUsername(fields.username), 300));
        fields.username.addEventListener('blur', () => validateUsername(fields.username));
    }

    if (fields.email) {
        fields.email.addEventListener('input', debounce(() => validateEmail(fields.email), 500));
        fields.email.addEventListener('blur', () => validateEmail(fields.email));
    }

    if (fields.password) {
        fields.password.addEventListener('input', debounce(() => validatePassword(fields.password), 200));
    }

    if (fields.dateOfBirth) {
        fields.dateOfBirth.addEventListener('change', () => validateDateOfBirth(fields.dateOfBirth));
    }

    if (fields.occupation) {
        fields.occupation.addEventListener('input', debounce(() => validateOccupation(fields.occupation), 300));
        fields.occupation.addEventListener('blur', () => validateOccupation(fields.occupation));
    }

    // Gender validation
    fields.gender.forEach(radio => {
        radio.addEventListener('change', () => validateGender());
    });

    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignupSubmission(fields);
    });
}

// Login Form Initialization
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const fields = {
        email: document.getElementById('loginEmail'),
        password: document.getElementById('loginPassword'),
        rememberMe: document.getElementById('rememberMe')
    };

    // Check if user should be remembered
    if (localStorage.getItem('mindsage_remember') === 'true') {
        if (fields.rememberMe) {
            fields.rememberMe.checked = true;
        }
    }

    // Password toggle functionality
    const passwordToggle = document.getElementById('loginPasswordToggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const passwordField = fields.password;
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.className = 'fas fa-eye-slash';
                this.setAttribute('aria-label', 'Hide password');
            } else {
                passwordField.type = 'password';
                icon.className = 'fas fa-eye';
                this.setAttribute('aria-label', 'Show password');
            }
        });
    }

    // Real-time validation
    if (fields.email) {
        fields.email.addEventListener('input', debounce(() => validateEmail(fields.email, 'loginEmail'), 500));
        fields.email.addEventListener('blur', () => validateEmail(fields.email, 'loginEmail'));
    }

    if (fields.password) {
        fields.password.addEventListener('input', debounce(() => validateLoginPassword(fields.password), 300));
    }

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLoginSubmission(fields);
    });
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validation Functions
function validateUsername(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById('username-error');
    
    if (value.length === 0) {
        showFieldError(field, errorElement, 'Username is required');
        return false;
    }
    
    if (value.length < 3) {
        showFieldError(field, errorElement, 'Username must be at least 3 characters');
        return false;
    }
    
    if (value.length > 20) {
        showFieldError(field, errorElement, 'Username must be less than 20 characters');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        showFieldError(field, errorElement, 'Username can only contain letters, numbers, hyphens, and underscores');
        return false;
    }
    
    // Simulate username availability check
    const unavailableUsernames = ['admin', 'test', 'user', 'mindsage', 'support', 'help'];
    if (unavailableUsernames.includes(value.toLowerCase())) {
        showFieldError(field, errorElement, 'This username is not available');
        return false;
    }
    
    showFieldSuccess(field, errorElement);
    return true;
}

function validateEmail(field, fieldId = 'email') {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    if (value.length === 0) {
        showFieldError(field, errorElement, 'Email is required');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showFieldError(field, errorElement, 'Please enter a valid email address');
        return false;
    }
    
    // Additional email validation
    if (value.length > 254) {
        showFieldError(field, errorElement, 'Email address is too long');
        return false;
    }
    
    showFieldSuccess(field, errorElement);
    return true;
}

function validatePassword(field) {
    const value = field.value;
    const errorElement = document.getElementById('password-error');
    
    if (value.length === 0) {
        showFieldError(field, errorElement, 'Password is required');
        updatePasswordStrength(0);
        return false;
    }
    
    if (value.length < 8) {
        showFieldError(field, errorElement, 'Password must be at least 8 characters long');
        updatePasswordStrength(1);
        return false;
    }
    
    if (value.length > 128) {
        showFieldError(field, errorElement, 'Password is too long');
        updatePasswordStrength(1);
        return false;
    }
    
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    let strength = 0;
    if (hasLower) strength++;
    if (hasUpper) strength++;
    if (hasNumber) strength++;
    if (hasSymbol) strength++;
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(value.toLowerCase())) {
        showFieldError(field, errorElement, 'This password is too common. Please choose a different one.');
        updatePasswordStrength(1);
        return false;
    }
    
    if (strength < 3) {
        showFieldError(field, errorElement, 'Password must contain uppercase, lowercase, numbers, and symbols');
        updatePasswordStrength(strength);
        return false;
    }
    
    showFieldSuccess(field, errorElement);
    updatePasswordStrength(strength);
    return true;
}

function validateLoginPassword(field) {
    const value = field.value;
    const errorElement = document.getElementById('loginPassword-error');
    
    if (value.length === 0) {
        showFieldError(field, errorElement, 'Password is required');
        return false;
    }
    
    showFieldSuccess(field, errorElement);
    return true;
}

function validateDateOfBirth(field) {
    const value = field.value;
    const errorElement = document.getElementById('dateOfBirth-error');
    
    if (!value) {
        showFieldError(field, errorElement, 'Date of birth is required');
        return false;
    }
    
    const birthDate = new Date(value);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
        showFieldError(field, errorElement, 'Please enter a valid date');
        return false;
    }
    
    // Check if date is in the future
    if (birthDate > today) {
        showFieldError(field, errorElement, 'Date of birth cannot be in the future');
        return false;
    }
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 13) {
        showFieldError(field, errorElement, 'You must be at least 13 years old to use MindSage');
        return false;
    }
    
    if (age > 120) {
        showFieldError(field, errorElement, 'Please enter a valid date of birth');
        return false;
    }
    
    showFieldSuccess(field, errorElement);
    return true;
}

function validateGender() {
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const errorElement = document.getElementById('gender-error');
    
    let isSelected = false;
    genderInputs.forEach(input => {
        if (input.checked) isSelected = true;
    });
    
    if (!isSelected) {
        if (errorElement) {
            errorElement.textContent = 'Please select your gender';
        }
        return false;
    }
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    return true;
}

function validateEmploymentStatus() {
    const field = document.getElementById('employmentStatus');
    const errorElement = document.getElementById('employmentStatus-error');
    
    if (!field.value) {
        showFieldError(field, errorElement, 'Please select your employment status');
        return false;
    }
    
    showFieldSuccess(field, errorElement);
    return true;
}

function validateOccupation(field) {
    const employmentStatus = document.getElementById('employmentStatus').value;
    const errorElement = document.getElementById('occupation-error');
    
    // Only validate if employment status requires occupation
    if (employmentStatus === 'student' || employmentStatus === 'employed') {
        const value = field.value.trim();
        
        if (value.length === 0) {
            const fieldType = employmentStatus === 'student' ? 'field of study' : 'occupation';
            showFieldError(field, errorElement, `Please enter your ${fieldType}`);
            return false;
        }
        
        if (value.length < 2) {
            showFieldError(field, errorElement, 'Please enter a valid response');
            return false;
        }
        
        if (value.length > 100) {
            showFieldError(field, errorElement, 'Please enter a shorter response');
            return false;
        }
    }
    
    showFieldSuccess(field, errorElement);
    return true;
}

function validateTermsAgreement() {
    const field = document.getElementById('agreeTerms');
    const errorElement = document.getElementById('agreeTerms-error');
    
    if (!field.checked) {
        if (errorElement) {
            errorElement.textContent = 'You must agree to the Terms and Privacy Policy to continue';
        }
        return false;
    }
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    return true;
}

// Helper Functions
function showFieldError(field, errorElement, message) {
    field.classList.remove('success');
    field.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function showFieldSuccess(field, errorElement) {
    field.classList.remove('error');
    field.classList.add('success');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function updatePasswordStrength(strength) {
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthFill || !strengthText) return;
    
    // Reset classes
    strengthFill.className = 'strength-fill';
    
    switch (strength) {
        case 0:
            strengthText.textContent = 'Enter a password';
            break;
        case 1:
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
            break;
        case 2:
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Fair password';
            break;
        case 3:
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Good password';
            break;
        case 4:
            strengthFill.classList.add('very-strong');
            strengthText.textContent = 'Strong password';
            break;
    }
}

// Form Submission Handlers
function handleSignupSubmission(fields) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Validate all fields
    const validations = [
        validateUsername(fields.username),
        validateEmail(fields.email),
        validatePassword(fields.password),
        validateDateOfBirth(fields.dateOfBirth),
        validateGender(),
        validateEmploymentStatus(),
        validateOccupation(fields.occupation),
        validateTermsAgreement()
    ];
    
    const isValid = validations.every(v => v === true);
    
    if (!isValid) {
        showNotification('Please fix the errors above before continuing', 'error');
        // Focus on first error field
        const firstError = document.querySelector('.form-input.error, .form-select.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    // Collect form data
    const formData = {
        username: fields.username.value.trim(),
        email: fields.email.value.trim(),
        password: fields.password.value,
        dateOfBirth: fields.dateOfBirth.value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        employmentStatus: fields.employmentStatus.value,
        occupation: fields.occupation.value.trim(),
        agreeTerms: fields.agreeTerms.checked,
        timestamp: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
        // Hide loading state
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        
        // Simulate success
        showNotification('🎉 Welcome to MindSage! Your account has been created successfully.', 'success');
        
        // Store user data in localStorage for demo purposes
        localStorage.setItem('mindsage_user', JSON.stringify({
            username: formData.username,
            email: formData.email,
            signupDate: formData.timestamp
        }));
        
        // Reset form
        document.getElementById('signupForm').reset();
        
        // Hide conditional fields
        const occupationGroup = document.getElementById('occupationGroup');
        if (occupationGroup) {
            occupationGroup.style.display = 'none';
        }
        
        // Reset password strength indicator
        updatePasswordStrength(0);
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2500);
    }, 2000);
}

function handleLoginSubmission(fields) {
    const submitBtn = document.getElementById('loginBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Validate fields
    const validations = [
        validateEmail(fields.email, 'loginEmail'),
        validateLoginPassword(fields.password)
    ];
    
    const isValid = validations.every(v => v === true);
    
    if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        // Focus on first error field
        const firstError = document.querySelector('.form-input.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    const email = fields.email.value.trim();
    const password = fields.password.value;
    
    // Simulate API call
    setTimeout(() => {
        // Hide loading state
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        
        // Demo credentials for testing
        if (email === 'demo@mindsage.com' && password === 'Demo123!') {
            showNotification('✅ Welcome back! Login successful.', 'success');
            
            // Store login state
            if (fields.rememberMe.checked) {
                localStorage.setItem('mindsage_remember', 'true');
            }
            
            localStorage.setItem('mindsage_logged_in', 'true');
            localStorage.setItem('mindsage_login_time', new Date().toISOString());
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('❌ Invalid email or password. Try: demo@mindsage.com / Demo123!', 'error');
        }
    }, 1500);
}

// Enhanced notification system with better mobile support
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${icon} ${message}</span>
            <button class="notification-close" aria-label="Close notification" type="button">&times;</button>
        </div>
    `;
    
    // Determine colors based on type
    let borderColor;
    switch (type) {
        case 'success':
            borderColor = 'var(--success-green)';
            break;
        case 'error':
            borderColor = 'var(--error-red)';
            break;
        case 'warning':
            borderColor = 'var(--warning-yellow)';
            break;
        default:
            borderColor = 'var(--electric-turquoise)';
    }
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        padding: 16px 20px;
        max-width: 420px;
        min-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid ${borderColor};
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 6 seconds for success/info, 8 seconds for errors
    const autoRemoveDelay = type === 'error' ? 8000 : 6000;
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, autoRemoveDelay);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            clearTimeout(autoRemove);
            removeNotification(notification);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'warning':
            return '⚠️';
        default:
            return 'ℹ️';
    }
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Check if user is logged in and update UI accordingly
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('mindsage_logged_in') === 'true';
    const userData = localStorage.getItem('mindsage_user');
    
    if (isLoggedIn && userData) {
        const user = JSON.parse(userData);
        // Update navigation if on main page
        const loginBtn = document.querySelector('.btn-login');
        const primaryBtn = document.querySelector('.btn-primary');
        
        if (loginBtn && primaryBtn) {
            loginBtn.textContent = `Welcome, ${user.username}`;
            loginBtn.href = '#';
            primaryBtn.textContent = 'Dashboard';
            primaryBtn.href = '#dashboard';
        }
    }
}

// Initialize login status check when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});