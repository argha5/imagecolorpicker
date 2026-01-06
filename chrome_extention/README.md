# ColorPickPro - Chrome Extension

A powerful Chrome extension for picking colors from any webpage with an intuitive interface and advanced features.

## Features

- 🎯 **Click-to-Pick**: Click anywhere on a webpage to pick colors
- 🔍 **Live Magnifier**: See zoomed preview with crosshair for precise color selection
- 📋 **Multiple Formats**: Get colors in HEX, RGB, and HSL formats
- 📜 **Color History**: Keep track of recently picked colors (up to 12)
- 🌓 **Dark Mode**: Toggle between light and dark themes
- ⚡ **Quick Actions**: Fast access to color values and copy functionality
- 🚀 **Full App**: Access the complete color picker application

## 📦 Chrome Web Store Publishing

Want to publish this extension? Check out our detailed step-by-step guide:
👉 **[How to Publish to Chrome Web Store](CHROME_WEB_STORE_GUIDE.md)**

It includes:
- How to pack the extension (`.zip`)
- Developer account setup
- Required assets and descriptions
- Privacy policy justifications

---

## 🛠️ Development & Installation

### Loading Unpacked Extension (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome_extention` folder
5. The extension icon should appear in your toolbar

### From Chrome Web Store (When Published)

1. Visit the Chrome Web Store
2. Search for "ColorPickPro"
3. Click "Add to Chrome"

## How to Use

### Method 1: Extension Popup
1. Click the ColorPickPro extension icon in your toolbar
2. Click "Start Picking Color"
3. Click anywhere on the webpage to pick a color
4. View color values in HEX, RGB, and HSL formats
5. Click any format to copy to clipboard

### Method 2: Context Menu
1. Right-click anywhere on a webpage
2. Select "Pick color from this page"
3. Click to pick a color

### Method 3: Keyboard Shortcut (Optional)
- Press `Alt+Shift+C` (customizable in Chrome extensions settings)

## Features Explained

### Color Picker
- **Magnifier**: Hover over any element to see a zoomed preview
- **Color Info**: Live HEX value displayed below magnifier
- **Crosshair**: Precise targeting for exact color selection
- **ESC to Cancel**: Press Escape key to exit color picker mode

### Color History
- Automatically saves last 12 picked colors
- Click any history color to reuse it
- One-click copy to clipboard
- Persists across browser sessions

### Theme Toggle
- Switch between light and dark modes
- Preference saved automatically
- Syncs with full app theme

### Full App Access
- Click "Open Full App" to access advanced features
- Upload images for color extraction
- Generate color palettes
- More detailed color information

## File Structure

```
chrome_extention/
├── manifest.json         # Extension configuration
├── popup.html           # Extension popup interface
├── popup.css            # Popup styling
├── popup.js             # Popup functionality
├── content.js           # Page color picking logic
├── content.css          # Content script styling
├── background.js        # Background service worker
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Permissions

The extension requires the following permissions:

- **activeTab**: To pick colors from the current webpage
- **storage**: To save color history and theme preference
- **scripting**: To inject color picker into webpages
- **contextMenus**: To add "Pick color" to the right-click menu
- **host_permissions (\<all_urls\>)**: To work on any website

## Privacy

- **100% Client-Side**: All color picking happens locally in your browser
- **No External Servers**: No data is sent to external servers
- **No Tracking**: We don't track your usage or collect any data
- **Local Storage Only**: Color history stored only in your browser

## Browser Compatibility

- Google Chrome (version 88+)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Other Chromium-based browsers

## Tips & Tricks

1. **Precise Picking**: Use the magnifier's crosshair for pixel-perfect color selection
2. **Quick Copy**: Click directly on color history items to copy
3. **Keyboard Shortcut**: Set up a custom keyboard shortcut in chrome://extensions/shortcuts
4. **Theme Sync**: Theme preference syncs between extension and full app
5. **ESC Key**: Quickly cancel color picking mode by pressing Escape

## Troubleshooting

### Extension Not Working
1. Refresh the page you're trying to pick from
2. Check if the extension is enabled in chrome://extensions/
3. Try reloading the extension

### Colors Look Different
- Some websites use CSS filters that may affect color appearance
- Browser zoom can affect color picking accuracy
- Try picking from the actual element background

### Magnifier Not Showing
- Ensure your browser supports the required features
- Check if the page has security restrictions
- Try reloading the extension

## Support

For issues, suggestions, or contributions:
1. Check existing issues first
2. Create a detailed bug report
3. Include browser version and steps to reproduce

## Credits

Created with ❤️ by the ColorPickPro team

## License

MIT License - See LICENSE file for details
