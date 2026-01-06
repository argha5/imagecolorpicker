// Content script for color picking functionality
(function () {
    'use strict';

    let isPickerActive = false;
    let magnifier = null;
    let overlay = null;
    let screenshotCanvas = null;
    let screenshotContext = null;

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'activateColorPicker') {
            activateColorPicker();
        }
    });

    function activateColorPicker() {
        if (isPickerActive) return;

        // Request screenshot from background
        chrome.runtime.sendMessage({ type: 'captureScreen' }, (response) => {
            if (response && response.dataUrl) {
                initializePicker(response.dataUrl);
            } else {
                console.error('Failed to capture screen');
            }
        });
    }

    function initializePicker(dataUrl) {
        isPickerActive = true;

        // precise cursor
        document.body.style.cursor = 'none'; // Hide default cursor, we'll use magnifier

        // Create canvas from screenshot
        const img = new Image();
        img.onload = () => {
            screenshotCanvas = document.createElement('canvas');
            screenshotCanvas.width = img.width;
            screenshotCanvas.height = img.height;
            screenshotContext = screenshotCanvas.getContext('2d', { willReadFrequently: true });
            screenshotContext.drawImage(img, 0, 0);

            createOverlay();
            createMagnifier();

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleKeydown);
        };
        img.src = dataUrl;
    }

    function deactivateColorPicker() {
        isPickerActive = false;
        document.body.style.cursor = '';

        if (overlay) {
            overlay.remove();
            overlay = null;
        }

        if (magnifier) {
            magnifier.remove();
            magnifier = null;
        }

        screenshotCanvas = null;
        screenshotContext = null;

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeydown);
    }

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.id = 'colorpicker-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: none;
            z-index: 999998;
            background: transparent;
        `;
        document.body.appendChild(overlay);
    }

    function createMagnifier() {
        magnifier = document.createElement('div');
        magnifier.id = 'colorpicker-magnifier';
        magnifier.style.cssText = `
            position: fixed;
            width: 140px;
            height: 140px;
            border: 4px solid #ffffff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999999;
            box-shadow: 0 0 0 2px #6366f1, 0 10px 20px rgba(0,0,0,0.3);
            display: none;
            overflow: hidden;
            background: #fff;
        `;

        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 140;
        // Pixelated rendering for crisp zoom
        canvas.style.cssText = 'width: 100%; height: 100%; image-rendering: pixelated;';
        magnifier.appendChild(canvas);

        const colorInfo = document.createElement('div');
        colorInfo.id = 'colorpicker-info';
        colorInfo.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(26, 26, 46, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            font-weight: bold;
            pointer-events: none;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        magnifier.appendChild(colorInfo);

        document.body.appendChild(magnifier);
    }

    function handleMouseMove(e) {
        if (!isPickerActive || !screenshotContext) return;

        const x = e.clientX;
        const y = e.clientY;
        const dpr = window.devicePixelRatio || 1;

        // Update magnifier position
        magnifier.style.display = 'block';
        // Center the magnifier on cursor
        magnifier.style.left = (x - 70) + 'px';
        magnifier.style.top = (y - 70) + 'px';

        // Get color at actual pixel position matches the screenshot scale
        // Screenshot is scaled by DPR
        const pixelX = Math.round(x * dpr);
        const pixelY = Math.round(y * dpr);

        const pixel = screenshotContext.getImageData(pixelX, pixelY, 1, 1).data;
        const color = { r: pixel[0], g: pixel[1], b: pixel[2] };

        // Update hex display
        const colorInfo = document.getElementById('colorpicker-info');
        if (colorInfo) {
            colorInfo.textContent = rgbToHex(color.r, color.g, color.b);
        }

        // Draw magnified view
        drawMagnifier(x, y, dpr);
    }

    function drawMagnifier(cursorX, cursorY, dpr) {
        const canvas = magnifier.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const zoom = 5; // Zoom level

        ctx.imageSmoothingEnabled = false; // Keep pixels sharp
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate source area from screenshot
        // We want to show a 28x28 area (140/5) centered on cursor
        const sourceSize = 28;
        const sourceX = (cursorX * dpr) - (sourceSize / 2);
        const sourceY = (cursorY * dpr) - (sourceSize / 2);

        // Draw zoomed image
        ctx.drawImage(
            screenshotCanvas,
            sourceX, sourceY, sourceSize, sourceSize, // Source
            0, 0, canvas.width, canvas.height // Destination
        );

        // Draw crosshair
        const center = canvas.width / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(center, 0);
        ctx.lineTo(center, canvas.height);
        ctx.moveTo(0, center);
        ctx.lineTo(canvas.width, center);
        ctx.stroke();

        // Draw center pixel outline
        const pixelSize = canvas.width / sourceSize; // should be 5
        const centerOffset = (canvas.width - pixelSize) / 2;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerOffset, centerOffset, pixelSize, pixelSize);
    }

    function handleClick(e) {
        if (!isPickerActive || !screenshotContext) return;

        e.preventDefault();
        e.stopPropagation();

        const dpr = window.devicePixelRatio || 1;
        const pixelX = Math.round(e.clientX * dpr);
        const pixelY = Math.round(e.clientY * dpr);

        const pixel = screenshotContext.getImageData(pixelX, pixelY, 1, 1).data;
        const color = { r: pixel[0], g: pixel[1], b: pixel[2] };

        // Send color to popup (background will handle history saving)
        chrome.runtime.sendMessage({
            type: 'colorPicked',
            color: color
        });

        // Handle Auto-Copy and Notification
        handleAutoCopy(color, e.clientX, e.clientY);

        deactivateColorPicker();
    }

    function handleAutoCopy(color, x, y) {
        chrome.storage.sync.get(['copyFormat'], (result) => {
            const format = result.copyFormat || 'hex';
            let valueToCopy = '';

            if (format === 'rgb') {
                valueToCopy = `rgb(${color.r}, ${color.g}, ${color.b})`;
            } else if (format === 'hsl') {
                valueToCopy = rgbToHsl(color.r, color.g, color.b);
            } else {
                valueToCopy = rgbToHex(color.r, color.g, color.b);
            }

            navigator.clipboard.writeText(valueToCopy).then(() => {
                showInPageToast(valueToCopy, x, y);
            });
        });
    }

    function showInPageToast(text, x, y) {
        const toast = document.createElement('div');
        toast.textContent = `Copied ${text}`;
        toast.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y - 40}px;
            background: #1a1a2e;
            color: #fff;
            padding: 8px 16px;
            border-radius: 8px;
            font-family: sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px) translateX(-50%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
        `;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) translateX(-50%)';
        });

        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px) translateX(-50%)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    function handleKeydown(e) {
        if (e.key === 'Escape' && isPickerActive) {
            deactivateColorPicker();
        }
    }

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
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
})();
