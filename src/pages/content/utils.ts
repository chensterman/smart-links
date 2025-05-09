/**
 * Utility functions for highlighting elements and displaying popups
 */

/**
 * Highlights a target element and displays a popup message next to it
 * 
 * @param {string} selector - CSS selector to find the target element
 * @param {string} popupText - Text content to display in the popup
 * @param {number} durationMs - How long before the message and highlight disappears (in milliseconds)
 * @param {boolean} waitForElement - Whether to wait for the element to appear
 * @param {number} maxWaitTime - Maximum time to wait for the element in milliseconds
 * @returns {Promise<boolean>} - Promise that resolves to true if the element was found and highlighted, false otherwise
 */
export const highlightElementWithPopup = async (
  selector: string,
  popupText: string,
  durationMs: number = 0, // 0 means it won't auto-disappear
  waitForElement: boolean = true,
  maxWaitTime: number = 5000
): Promise<boolean> => {
  // Find the target element with waiting if needed
  let targetElement: Element | null = null;
  
  if (waitForElement) {
    // Wait for the element to appear
    const startTime = Date.now();
    while (!targetElement && Date.now() - startTime < maxWaitTime) {
      targetElement = document.querySelector(selector);
      if (!targetElement) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } else {
    targetElement = document.querySelector(selector);
  }
  
  if (!targetElement) {
    console.log(`Target element not found with selector: ${selector} after waiting ${maxWaitTime}ms`);
    return false;
  }
  
  console.log(`Target element found with selector: ${selector}, applying highlight`);
    
  // Add highlight class to the element
  targetElement.classList.add('smart-link-highlight');
    
  // Create popup element
  const popup = document.createElement('div');
  popup.className = 'smart-link-popup';
  popup.textContent = popupText;
  document.body.appendChild(popup);
    
  // Position the popup next to the element
  const elementRect = targetElement.getBoundingClientRect();
  popup.style.top = `${elementRect.top + window.scrollY}px`;
  popup.style.left = `${elementRect.right + window.scrollX + 30}px`;
    
  // Function to remove highlight and popup
  const removeHighlightAndPopup = () => {
    targetElement.classList.remove('smart-link-highlight');
    popup.remove();
  };
  
  // Add click event to remove highlight and popup when element is clicked
  targetElement.addEventListener('click', removeHighlightAndPopup);
  
  // If duration is specified, automatically remove after that time
  if (durationMs > 0) {
    console.log(`Waiting ${durationMs}ms for highlight to complete before proceeding`);
    setTimeout(removeHighlightAndPopup, durationMs);
  }
  
  return true;
};

/**
 * Promise-based version of highlightElementWithPopup that resolves after the specified duration
 * 
 * @param {string} selector - CSS selector to find the target element
 * @param {string} popupText - Text content to display in the popup
 * @param {number} durationMs - How long before the message and highlight disappears (in milliseconds)
 * @param {boolean} waitForElement - Whether to wait for the element to appear
 * @param {number} maxWaitTime - Maximum time to wait for the element in milliseconds
 * @returns {Promise<boolean>} - Promise that resolves to true if successful, false otherwise
 */
export const highlightElementWithPopupAsync = async (
  selector: string,
  popupText: string,
  durationMs: number = 0, // 0 means it won't auto-disappear
  waitForElement: boolean = true,
  maxWaitTime: number = 5000
): Promise<boolean> => {
  // Since highlightElementWithPopup is now async, we can just call it directly
  const success = await highlightElementWithPopup(selector, popupText, durationMs, waitForElement, maxWaitTime);
  
  if (!success) {
    return false;
  }
  
  if (durationMs > 0) {
    // If we have a duration, wait for that time (plus a small buffer) before resolving
    // This ensures we wait for the full duration before proceeding to the next step
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('Highlight duration completed');
        resolve(true);
      }, durationMs + 100);
    });
  }
  
  return true;
};

/**
 * Type definition for a highlight step
 */
export type HighlightStep = {
  // For regular highlight steps
  selector?: string;
  text?: string;
  duration?: number;
  
  // For action steps
  action?: () => Promise<void> | void;
  
  // Optional delay after this step
  delayAfter?: number;
};

/**
 * Sequentially highlights multiple elements with popups and performs custom actions
 * 
 * @param {Array<HighlightStep>} steps - Array of highlight and action steps
 * @param {number} defaultDelay - Default delay between steps in milliseconds
 */
export const sequentialHighlights = async (
  steps: Array<HighlightStep>,
  defaultDelay: number = 500
): Promise<void> => {
  console.log(`Starting sequential walkthrough with ${steps.length} steps`);
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`Processing step ${i + 1} of ${steps.length}`);
    
    // If it's a highlight step
    if (step.selector && step.text) {
      console.log(`Highlighting element with selector: ${step.selector}`);
      await highlightElementWithPopupAsync(step.selector, step.text, step.duration || 0);
      console.log(`Highlight step ${i + 1} completed`);
    }
    
    // If it's an action step
    if (step.action) {
      console.log(`Executing action in step ${i + 1}`);
      await Promise.resolve(step.action());
      console.log(`Action in step ${i + 1} completed`);
    }
    
    // Add a delay after this step if specified or if there's a default delay
    if (i < steps.length - 1) {
      const delay = step.delayAfter !== undefined ? step.delayAfter : defaultDelay;
      if (delay > 0) {
        console.log(`Waiting ${delay}ms before next step`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log('Sequential walkthrough completed');
};

/**
 * Find an element by its text content
 * 
 * @param {string} tagName - HTML tag name (e.g., 'p', 'div', 'span')
 * @param {string} text - Text content to search for
 * @param {boolean} exactMatch - Whether the text must match exactly or just contain
 * @returns {Element|null} - The found element or null
 */
export const findElementByText = (
  tagName: string,
  text: string,
  exactMatch: boolean = false
): Element | null => {
  const elements = document.getElementsByTagName(tagName);
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elementText = element.textContent || '';
    
    if (exactMatch) {
      if (elementText === text) {
        return element;
      }
    } else {
      if (elementText.includes(text)) {
        return element;
      }
    }
  }
  
  return null;
};

/**
 * Helper function to create a step that clicks an element
 * 
 * @param {string} selector - CSS selector for the element to click
 * @param {boolean} waitForElement - Whether to wait for the element to appear
 * @param {number} maxWaitTime - Maximum time to wait for the element in milliseconds
 * @returns {HighlightStep} - A step that can be used in sequentialHighlights
 */
export const createClickStep = (
  selector: string,
  waitForElement: boolean = true,
  maxWaitTime: number = 2000
): HighlightStep => {
  return {
    action: async () => {
      let element: Element | null = null;
      
      if (waitForElement) {
        // Wait for the element to appear
        const startTime = Date.now();
        while (!element && Date.now() - startTime < maxWaitTime) {
          element = document.querySelector(selector);
          if (!element) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } else {
        element = document.querySelector(selector);
      }
      
      if (element) {
        console.log(`Clicking element with selector: ${selector}`);
        (element as HTMLElement).click();
      } else {
        console.warn(`Element with selector ${selector} not found for clicking`);
      }
    }
  };
};

/**
 * Helper function to create a step that clicks an element found by its text content
 * 
 * @param {string} tagName - HTML tag name (e.g., 'p', 'div', 'span')
 * @param {string} text - Text content to search for
 * @param {boolean} exactMatch - Whether the text must match exactly or just contain
 * @param {boolean} waitForElement - Whether to wait for the element to appear
 * @param {number} maxWaitTime - Maximum time to wait for the element in milliseconds
 * @returns {HighlightStep} - A step that can be used in sequentialHighlights
 */
export const createClickByTextStep = (
  tagName: string,
  text: string,
  exactMatch: boolean = false,
  waitForElement: boolean = true,
  maxWaitTime: number = 5000
): HighlightStep => {
  return {
    action: async () => {
      let element: Element | null = null;
      
      if (waitForElement) {
        // Wait for the element to appear
        const startTime = Date.now();
        while (!element && Date.now() - startTime < maxWaitTime) {
          element = findElementByText(tagName, text, exactMatch);
          if (!element) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } else {
        element = findElementByText(tagName, text, exactMatch);
      }
      
      if (element) {
        console.log(`Clicking ${tagName} element containing text: "${text}"`);
        (element as HTMLElement).click();
      } else {
        console.warn(`${tagName} element containing text "${text}" not found for clicking`);
      }
    }
  };
};

/**
 * Highlights an element found by its text content and displays a popup message next to it
 * 
 * @param {string} tagName - HTML tag name (e.g., 'p', 'div', 'span')
 * @param {string} searchText - Text content to search for in the element
 * @param {string} popupText - Text content to display in the popup
 * @param {number} durationMs - How long before the message and highlight disappears (in milliseconds)
 * @param {boolean} exactMatch - Whether the text must match exactly or just contain
 * @returns {Promise<boolean>} - Promise that resolves to true if successful, false otherwise
 */
export const highlightElementByTextAsync = async (
  tagName: string,
  searchText: string,
  popupText: string,
  durationMs: number = 0,
  exactMatch: boolean = false
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Find the element by its text content
    const element = findElementByText(tagName, searchText, exactMatch);
    
    if (!element) {
      console.log(`Element ${tagName} containing "${searchText}" not found for highlighting`);
      resolve(false);
      return;
    }
    
    console.log(`Found ${tagName} element containing "${searchText}", applying highlight`);
    
    // Add highlight class to the element
    element.classList.add('smart-link-highlight');
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'smart-link-popup';
    popup.textContent = popupText;
    document.body.appendChild(popup);
    
    // Position the popup next to the element
    const elementRect = element.getBoundingClientRect();
    popup.style.top = `${elementRect.top + window.scrollY}px`;
    popup.style.left = `${elementRect.right + window.scrollX + 30}px`;
    
    // Function to remove highlight and popup
    const removeHighlightAndPopup = () => {
      element.classList.remove('smart-link-highlight');
      popup.remove();
    };
    
    // Add click event to remove highlight and popup when element is clicked
    element.addEventListener('click', removeHighlightAndPopup);
    
    // If duration is specified, automatically remove after that time
    if (durationMs > 0) {
      console.log(`Waiting ${durationMs}ms for highlight to complete before proceeding`);
      setTimeout(() => {
        removeHighlightAndPopup();
        console.log('Highlight duration completed');
        resolve(true);
      }, durationMs);
    } else {
      // If no duration, resolve immediately
      resolve(true);
    }
  });
};

/**
 * Helper function to create a highlight step for an element found by its text content
 * 
 * @param {string} tagName - HTML tag name (e.g., 'p', 'div', 'span')
 * @param {string} searchText - Text content to search for in the element
 * @param {string} popupText - Text content to display in the popup
 * @param {number} durationMs - How long before the message and highlight disappears (in milliseconds)
 * @param {boolean} exactMatch - Whether the text must match exactly or just contain
 * @returns {HighlightStep} - A step that can be used in sequentialHighlights
 */
export const createHighlightByTextStep = (
  tagName: string,
  searchText: string,
  popupText: string,
  durationMs: number = 0,
  exactMatch: boolean = false
): HighlightStep => {
  return {
    action: async () => {
      await highlightElementByTextAsync(tagName, searchText, popupText, durationMs, exactMatch);
    }
  };
};

/**
 * Types text character by character into an input field or textarea, simulating human typing
 * 
 * @param {string|Element} targetElement - CSS selector or DOM element (input or textarea)
 * @param {string} text - The text to type
 * @param {number} typingSpeed - Delay between characters in milliseconds (simulates typing speed)
 * @param {boolean} clearExisting - Whether to clear existing content before typing
 * @param {boolean} waitForElement - Whether to wait for the element to appear
 * @param {number} maxWaitTime - Maximum time to wait for the element in milliseconds
 * @returns {Promise<boolean>} - Promise that resolves to true if successful, false otherwise
 */
export const typeTextAsync = async (
  targetElement: string | Element,
  text: string,
  typingSpeed: number = 50,
  clearExisting: boolean = true,
  waitForElement: boolean = true,
  maxWaitTime: number = 5000
): Promise<boolean> => {
  // Find the element if a selector was provided
  let element: Element | null = null;
  
  if (typeof targetElement === 'string') {
    if (waitForElement) {
      // Wait for the element to appear
      const startTime = Date.now();
      while (!element && Date.now() - startTime < maxWaitTime) {
        element = document.querySelector(targetElement);
        if (!element) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } else {
      element = document.querySelector(targetElement);
    }
    
    if (!element) {
      console.log(`Input element not found with selector: ${targetElement} after waiting ${maxWaitTime}ms`);
      return false;
    }
  } else {
    element = targetElement;
  }
  
  // Check if the element is an input or textarea
  if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
    console.log('Target element is not an input or textarea');
    return false;
  }
  
  // Focus the element
  element.focus();
  
  // Clear existing content if requested
  if (clearExisting) {
    element.value = '';
  }
  
  // Type each character with a delay
  for (let i = 0; i < text.length; i++) {
    // Append the next character
    element.value += text[i];
    
    // Dispatch input event to trigger any listeners
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    // Wait for the specified typing speed
    await new Promise(resolve => setTimeout(resolve, typingSpeed));
  }
  
  // Dispatch a final change event
  const changeEvent = new Event('change', { bubbles: true });
  element.dispatchEvent(changeEvent);
  
  console.log(`Successfully typed text into ${element.tagName.toLowerCase()}`);
  return true;
};

/**
 * Helper function to create a step that types text into an input field or textarea
 * 
 * @param {string} selector - CSS selector for the input element
 * @param {string} text - The text to type
 * @param {number} typingSpeed - Delay between characters in milliseconds
 * @param {boolean} clearExisting - Whether to clear existing content before typing
 * @returns {HighlightStep} - A step that can be used in sequentialHighlights
 */
export const createTypeTextStep = (
  selector: string,
  text: string,
  typingSpeed: number = 50,
  clearExisting: boolean = true
): HighlightStep => {
  return {
    action: async () => {
      await typeTextAsync(selector, text, typingSpeed, clearExisting);
    }
  };
};

/**
 * Scrolls to a specific element on the page, making it visible
 * 
 * @param {string|Element} targetElement - CSS selector or DOM element to scroll to
 * @param {ScrollBehavior} behavior - Scroll behavior ('auto', 'smooth')
 * @param {'start'|'center'|'end'|'nearest'} block - Vertical alignment
 * @param {'start'|'center'|'end'|'nearest'} inline - Horizontal alignment
 * @param {boolean} waitForElement - Whether to wait for the element to appear
 * @param {number} maxWaitTime - Maximum time to wait for the element in milliseconds
 * @returns {Promise<boolean>} - Promise that resolves to true if successful, false otherwise
 */
export const scrollToElementAsync = async (
  targetElement: string | Element,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'center',
  inline: ScrollLogicalPosition = 'nearest',
  waitForElement: boolean = true,
  maxWaitTime: number = 5000
): Promise<boolean> => {
  // Find the element if a selector was provided
  let element: Element | null = null;
  
  if (typeof targetElement === 'string') {
    if (waitForElement) {
      // Wait for the element to appear
      const startTime = Date.now();
      while (!element && Date.now() - startTime < maxWaitTime) {
        element = document.querySelector(targetElement);
        if (!element) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } else {
      element = document.querySelector(targetElement);
    }
    
    if (!element) {
      console.log(`Element not found with selector: ${targetElement} after waiting ${maxWaitTime}ms`);
      return false;
    }
  } else {
    element = targetElement;
  }
  
  // Scroll the element into view
  try {
    element.scrollIntoView({ behavior, block, inline });
    
    // Add a small delay to allow the scroll to complete
    if (behavior === 'smooth') {
      // For smooth scrolling, wait a bit longer
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully scrolled to element ${element.tagName.toLowerCase()}`);
    return true;
  } catch (error) {
    console.error('Error scrolling to element:', error);
    return false;
  }
};

/**
 * Helper function to create a step that scrolls to an element
 * 
 * @param {string} selector - CSS selector for the element to scroll to
 * @param {ScrollBehavior} behavior - Scroll behavior ('auto', 'smooth')
 * @param {'start'|'center'|'end'|'nearest'} block - Vertical alignment
 * @param {'start'|'center'|'end'|'nearest'} inline - Horizontal alignment
 * @returns {HighlightStep} - A step that can be used in sequentialHighlights
 */
export const createScrollToStep = (
  selector: string,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'center',
  inline: ScrollLogicalPosition = 'nearest'
): HighlightStep => {
  return {
    action: async () => {
      await scrollToElementAsync(selector, behavior, block, inline);
    }
  };
};

/**
 * Helper function to create a step that scrolls to an element found by its text content
 * 
 * @param {string} tagName - HTML tag name (e.g., 'p', 'div', 'span')
 * @param {string} searchText - Text content to search for in the element
 * @param {boolean} exactMatch - Whether the text must match exactly or just contain
 * @param {ScrollBehavior} behavior - Scroll behavior ('auto', 'smooth')
 * @param {'start'|'center'|'end'|'nearest'} block - Vertical alignment
 * @param {'start'|'center'|'end'|'nearest'} inline - Horizontal alignment
 * @returns {HighlightStep} - A step that can be used in sequentialHighlights
 */
export const createScrollToTextStep = (
  tagName: string,
  searchText: string,
  exactMatch: boolean = false,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'center',
  inline: ScrollLogicalPosition = 'nearest'
): HighlightStep => {
  return {
    action: async () => {
      // Find the element by text content
      const element = findElementByText(tagName, searchText, exactMatch);
      
      if (element) {
        await scrollToElementAsync(element, behavior, block, inline);
      } else {
        console.warn(`${tagName} element containing text "${searchText}" not found for scrolling`);
      }
    }
  };
};
