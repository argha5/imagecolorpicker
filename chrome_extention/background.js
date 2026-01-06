// Background service worker for Chrome extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    // Set default settings on install
    if (details.reason === 'install') {
        chrome.storage.sync.set({
            theme: 'light',
            colorHistory: []
        });

        // Open welcome page on first install
        chrome.tabs.create({
            url: 'https://argha5.github.io/imagecolorpicker/'
        });
    }

    // Create context menu (runs on install and update)
    chrome.contextMenus.create({
        id: 'pickColor',
        title: 'Pick color from this page',
        contexts: ['page', 'image']
    });
});


// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'colorPicked') {
        const color = message.color;

        // 1. Forward color to popup if it's open (for immediate UI update if user is looking)
        chrome.runtime.sendMessage(message).catch(() => { });

        // 2. Save to history (Primary storage logic now lives here)
        chrome.storage.sync.get(['colorHistory'], (result) => {
            let history = result.colorHistory || [];
            const hex = '#' + [color.r, color.g, color.b].map(x => {
                const h = x.toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('').toUpperCase();

            // Remove duplicate if exists
            history = history.filter(c => c !== hex);
            // Add to top
            history.unshift(hex);
            // Limit to 12
            if (history.length > 12) history = history.slice(0, 12);

            chrome.storage.sync.set({ colorHistory: history });
        });

    } else if (message.type === 'captureScreen') {
        // Capture visible tab for color picking
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            sendResponse({ dataUrl: dataUrl });
        });
        return true; // Keep message channel open for async response
    }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'pickColor') {
        // Inject content script and activate color picker
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).then(() => {
            chrome.tabs.sendMessage(tab.id, { type: 'activateColorPicker' });
        }).catch((error) => {
            console.error('Failed to inject color picker:', error);
        });
    }
});

// Keyboard shortcut handler
if (chrome.commands) {
    chrome.commands.onCommand.addListener((command) => {
        if (command === 'pick-color') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ['content.js']
                    }).then(() => {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'activateColorPicker' });
                    }).catch((error) => {
                        console.error('Failed to inject color picker:', error);
                    });
                }
            });
        }
    });
}
