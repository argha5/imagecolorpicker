# How to Publish ColorPickPro to Chrome Web Store

This guide will walk you through the process of publishing your **ColorPickPro** extension to the Chrome Web Store.

## 1. Preparation

### ✅ Verify Files
Ensure your project contains:
- `manifest.json` (Version 1.0.0)
- `popup.html`, `popup.css`, `popup.js`
- `content.js`, `content.css`
- `background.js`
- `icons/` folder with 16, 32, 48, 128 px icons

### 📦 Create the Zip Package
You need to upload a single `.zip` file containing your extension code.

**Method A: Using the Script (Recommended)**
1. In VS Code terminal, make sure you are in the `chrome_extention` directory:
   ```powershell
   cd "c:\color Picker\chrome_extention"
   ```
2. Run the packing script:
   ```powershell
   .\pack_extension.ps1
   ```
   *This will create `ColorPickPro-v1.0.0.zip` with only the necessary files.*

**Method B: Manual Zipping**
1. Select the following files/folders ONLY:
   - `manifest.json`
   - `popup.html`, `popup.css`, `popup.js`
   - `content.js`
   - `background.js`
   - `icons/`
2. Right-click > **Compress to ZIP file**.
3. Name it `ColorPickPro.zip`.

---

## 2. Developer Account Setup

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
2. Sign in with your Google Account.
3. If this is your first time, you must pay a **one-time registration fee of $5**.
4. Complete the account setup.

---

## 3. Uploading the Item

1. Inside the Dashboard, click the **" + New Item"** button (top right).
2. Drag and drop your `ColorPickPro-v1.0.0.zip` file.
3. The store will process your upload and open the **Store Listing** page.

---

## 4. Completing the Store Listing

You need to fill out the following details.

### 📝 Store Listing
*   **Description**: The summary from `manifest.json` will be auto-filled. You can expand it here.
    > ColorPickPro is an advanced color picker tool that lets you extract colors from any website with pixel-perfect accuracy.
    > 
    > **Features:**
    > *   **Pixel-Perfect Picking**: Accurately pick colors from images, videos, and canvas elements using a 5x zoom magnifier.
    > *   **Instant Formats**: Automatically get HEX, RGB, and HSL values.
    > *   **Color History**: Saves your last 12 picked colors.
    > *   **Auto-Copy**: Click to pick and automatically copy the code to your clipboard.
    > *   **Privacy Focused**: Runs entirely locally in your browser.
*   **Category**: Select **"Developer Tools"** or **"Productivity"**.
*   **Language**: English.

### 🖼️ Graphic Assets (Required)
You will need to create and upload these images. 
*   **Store Icon**: 128x128 pixels (You can use `icons/icon128.png`).
*   **Screenshot**: 1280x800 or 640x400 pixels (JPEG or PNG).
    *   *Tip: Take a screenshot of your extension running on a nice webpage.*
*   **Marquee / Promo Tile** (Small): 440x280 pixels.
    *   *Tip: This is the banner shown in the store. Use your brand color and logo.*

---

## 5. Privacy Practices

1. Switch to the **"Privacy"** tab.
2. **Single Purpose**:
   *   "The single purpose of this extension is to...": **Pick colors from web pages.**
3. **Permissions justification**:
   *   **activeTab**: "Required to access the current page content when the user clicks the extension icon to pick a color."
   *   **scripting**: "Used to inject the color picker overlay and magnifier into the webpage."
   *   **storage**: "Used to try saving the user's color history and theme preference locally."
   *   **contextMenus**: "Required to add the 'Pick color' option to the right-click menu."
4. **Data Usage**:
   *   We do **NOT** collect any remote data.
   *   Check "No" for "Does this extension collect user data?".
   *   Check "No" for remote code.

---

## 6. Submission

1. Click **"Submit for Review"** at the top right.
2. Google usually takes **24–48 hours** to review the extension.
3. Once approved, you will get an email, and it will be live on the store!

---

## 7. After Publishing

1. **Get the Link**: Once live, you will get a permanent URL (e.g., `chrome.google.com/webstore/detail/...`).
2. **Update Your Website**: Replace the GitHub link on your `index.html` with this official Store link for a better user experience.
