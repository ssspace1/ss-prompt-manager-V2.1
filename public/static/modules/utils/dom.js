// SS Prompt Manager - DOM Utility Functions
// This module contains DOM manipulation and UI helper functions

/**
 * Show loading spinner with message
 * @param {string} message - Loading message to display
 */
export function showLoading(message = 'Loading...') {
  const loader = document.getElementById('loader');
  const loadingMessage = document.getElementById('loading-message');
  
  if (loader) {
    loader.classList.remove('hidden');
    if (loadingMessage) {
      loadingMessage.textContent = message;
    }
  }
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
  }
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Type of notification (success, error, info)
 */
export function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transition-all duration-300 ${getNotificationColor(type)}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 3000);
}

/**
 * Get notification color classes based on type
 * @param {string} type - Notification type
 * @returns {string} CSS classes for notification color
 */
function getNotificationColor(type) {
  switch (type) {
    case 'success':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    case 'warning':
      return 'bg-yellow-500';
    default:
      return 'bg-blue-500';
  }
}

/**
 * Load prompt content to textarea
 * @param {string} textareaId - ID of textarea element
 * @param {string} content - Content to load
 */
export function loadPromptToTextarea(textareaId, content) {
  const textarea = document.getElementById(textareaId);
  if (textarea) {
    textarea.value = content || '';
  }
}

/**
 * Get element value by ID
 * @param {string} elementId - Element ID
 * @returns {string|null} Element value or null if not found
 */
export function getElementValue(elementId) {
  const element = document.getElementById(elementId);
  return element ? element.value : null;
}

/**
 * Set element value by ID
 * @param {string} elementId - Element ID  
 * @param {string} value - Value to set
 */
export function setElementValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  }
}

/**
 * Toggle element visibility
 * @param {string} elementId - Element ID
 * @param {boolean} show - Whether to show (true) or hide (false)
 */
export function toggleElement(elementId, show) {
  const element = document.getElementById(elementId);
  if (element) {
    if (show) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  }
}

/**
 * Add event listener to element by ID
 * @param {string} elementId - Element ID
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 */
export function addEventListenerById(elementId, event, handler) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener(event, handler);
  }
}

/**
 * Update slider value display
 * @param {string} sliderId - Slider element ID
 * @param {string} valueDisplayId - Value display element ID
 */
export function updateSliderDisplay(sliderId, valueDisplayId) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(valueDisplayId);
  
  if (slider && display) {
    display.textContent = slider.value;
  }
}