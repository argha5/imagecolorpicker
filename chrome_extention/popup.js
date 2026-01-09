// DOM Elements
const elements = {
    pickColorBtn: document.getElementById('pickColorBtn'),
    colorDisplay: document.getElementById('colorDisplay'),
    colorBox: document.getElementById('colorBox'),
    hexValue: document.getElementById('hexValue'),
    rgbValue: document.getElementById('rgbValue'),
    hslValue: document.getElementById('hslValue'),
    historySection: document.getElementById('historySection'),
    colorHistory: document.getElementById('colorHistory'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    openFullAppBtn: document.getElementById('openFullAppBtn'),
    formatSelect: document.getElementById('formatSelect'),
    themeToggle: document.getElementById('themeToggle'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// State
let currentColor = null;
let colorHistory = [];
const MAX_HISTORY = 12;

// Initialize
function init() {
    // Load saved settings
    chrome.storage.sync.get(['theme', 'colorHistory', 'copyFormat'], (result) => {
        // Theme
        const theme = result.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);

        // History
        colorHistory = result.colorHistory || [];
        updateHistoryDisplay();

        // Format Preference
        if (result.copyFormat) {
            elements.formatSelect.value = result.copyFormat;
        }
    });

    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    elements.pickColorBtn.addEventListener('click', startColorPicker);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.openFullAppBtn.addEventListener('click', openFullApp);

    // Save format preference
    elements.formatSelect.addEventListener('change', (e) => {
        chrome.storage.sync.set({ copyFormat: e.target.value });
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', handleCopy);
    });

    // Listen for color picked from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'colorPicked') {
            handleColorPicked(message.color);
        }
    });
}

// Start Color Picker
async function startColorPicker() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Inject content script if not already injected
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        // Send message to activate color picker
        chrome.tabs.sendMessage(tab.id, { type: 'activateColorPicker' });

        // Close popup so user can pick
        window.close();
    } catch (error) {
        console.error('Error starting color picker:', error);
        showToast('Failed to start color picker');
    }
}

// Handle Color Picked
function handleColorPicked(color) {
    currentColor = color;
    updateColorDisplay(color);
    addToHistory(color);
    elements.colorDisplay.style.display = 'flex';
}

// Update Color Display
function updateColorDisplay(color) {
    const { r, g, b } = color;
    const colorStr = `rgb(${r}, ${g}, ${b})`;

    elements.colorBox.style.backgroundColor = colorStr;
    elements.hexValue.textContent = rgbToHex(r, g, b);
    elements.rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
    elements.hslValue.textContent = rgbToHsl(r, g, b);
}

// Add to History
function addToHistory(color) {
    const hex = rgbToHex(color.r, color.g, color.b);

    // Remove if already exists
    colorHistory = colorHistory.filter(c => c !== hex);

    // Add to beginning
    colorHistory.unshift(hex);

    // Limit history size
    if (colorHistory.length > MAX_HISTORY) {
        colorHistory = colorHistory.slice(0, MAX_HISTORY);
    }

    // Save to storage
    chrome.storage.sync.set({ colorHistory });

    updateHistoryDisplay();
}

// Update History Display
function updateHistoryDisplay() {
    if (colorHistory.length === 0) {
        elements.historySection.style.display = 'none';
        return;
    }

    elements.historySection.style.display = 'flex';
    elements.colorHistory.innerHTML = '';

    colorHistory.forEach(hex => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'history-color';
        colorDiv.style.backgroundColor = hex;
        colorDiv.title = hex;

        colorDiv.addEventListener('click', () => {
            const r = parseInt(hex.substr(1, 2), 16);
            const g = parseInt(hex.substr(3, 2), 16);
            const b = parseInt(hex.substr(5, 2), 16);

            handleColorPicked({ r, g, b });
            navigator.clipboard.writeText(hex);
            showToast(`Copied ${hex}`);
        });

        elements.colorHistory.appendChild(colorDiv);
    });
}

// Clear History
function clearHistory() {
    colorHistory = [];
    chrome.storage.sync.set({ colorHistory: [] });
    updateHistoryDisplay();
    showToast('History cleared');
}

// Open Full App
function openFullApp() {
    chrome.tabs.create({ url: 'https://image-colorpicker.pages.dev/' });
}

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    chrome.storage.sync.set({ theme: newTheme });
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Copy to Clipboard
function handleCopy(e) {
    const format = e.currentTarget.getAttribute('data-format');
    const value = document.getElementById(`${format}Value`).textContent;

    navigator.clipboard.writeText(value).then(() => {
        showToast(`Copied ${value}`);
    });
}

// Color Conversion Functions
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

// Toast Notification
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2000);
}

// Initialize on load
init();
