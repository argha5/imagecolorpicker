// ===== State Management =====
let currentImage = null;
let currentColor = { r: 0, g: 0, b: 0 };
let canvas = null;
let ctx = null;
let paletteSize = 8;

// ===== DOM Elements =====
const elements = {
    fileInput: document.getElementById('fileInput'),
    uploadArea: document.getElementById('uploadArea'),
    useImageBtn: document.getElementById('useImageBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    urlInput: document.getElementById('urlInput'),
    loadUrlBtn: document.getElementById('loadUrlBtn'),
    clearBtn: document.getElementById('clearBtn'),
    themeToggle: document.getElementById('themeToggle'),
    canvasWrapper: document.getElementById('canvasWrapper'),
    imageCanvas: document.getElementById('imageCanvas'),
    magnifier: document.getElementById('magnifier'),
    colorBox1: document.getElementById('colorBox1'),
    colorBox2: document.getElementById('colorBox2'),
    hexValue: document.getElementById('hexValue'),
    rgbValue: document.getElementById('rgbValue'),
    hslValue: document.getElementById('hslValue'),
    paletteContainer: document.getElementById('paletteContainer'),
    paletteGrid: document.getElementById('paletteGrid'),
    decreasePalette: document.getElementById('decreasePalette'),
    increasePalette: document.getElementById('increasePalette'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ===== Initialization =====
function init() {
    canvas = elements.imageCanvas;
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    setupEventListeners();

    // Load default image
    loadDefaultImage();
}

// ===== Event Listeners =====
function setupEventListeners() {
    // File upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.useImageBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);

    // Paste from clipboard
    elements.pasteBtn.addEventListener('click', handlePaste);

    // URL input
    elements.loadUrlBtn.addEventListener('click', handleUrlLoad);
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUrlLoad();
    });

    // Canvas interaction
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    // Clear button
    elements.clearBtn.addEventListener('click', clearImage);

    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Palette controls
    elements.decreasePalette.addEventListener('click', () => {
        if (paletteSize > 4) {
            paletteSize--;
            extractPalette();
        }
    });
    elements.increasePalette.addEventListener('click', () => {
        if (paletteSize < 16) {
            paletteSize++;
            extractPalette();
        }
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn-compact').forEach(btn => {
        btn.addEventListener('click', handleCopy);
    });
}

// ===== Load Default Image =====
function loadDefaultImage() {
    const defaultImg = document.getElementById('defaultImage');
    if (defaultImg && defaultImg.complete && defaultImg.naturalWidth > 0) {
        // Image already loaded
        processDefaultImage(defaultImg);
    } else if (defaultImg) {
        // Wait for image to load
        defaultImg.onload = () => processDefaultImage(defaultImg);
        defaultImg.onerror = () => {
            console.error('Failed to load default image');
            // Show upload area if default image fails
            elements.uploadArea.style.display = 'flex';
            elements.canvasWrapper.style.display = 'none';
        };
    }
}

function processDefaultImage(img) {
    currentImage = img;

    // Draw image to canvas
    displayImage(img);

    // Hide the img element, show the canvas
    const defaultImgElement = document.getElementById('defaultImage');
    if (defaultImgElement) {
        defaultImgElement.style.display = 'none';
    }
    canvas.style.display = 'block';

    // Show palette and controls
    elements.paletteContainer.style.display = 'flex';
    elements.clearBtn.style.display = 'block';

    // Extract color palette
    extractPalette();

    // Set initial color from center of image
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const imageData = ctx.getImageData(centerX, centerY, 1, 1);
    const pixel = imageData.data;

    currentColor = {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2]
    };

    updateColorDisplay();
}

// ===== File Handling =====
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageFromFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageFromFile(file);
    }
}

async function handlePaste() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            for (const type of item.types) {
                if (type.startsWith('image/')) {
                    const blob = await item.getType(type);
                    loadImageFromFile(blob);
                    return;
                }
            }
        }
        showToast('No image found in clipboard');
    } catch (err) {
        showToast('Failed to read clipboard. Please grant permission.');
    }
}

function handleUrlLoad() {
    const url = elements.urlInput.value.trim();
    if (!url) {
        showToast('Please enter a valid URL');
        return;
    }
    loadImageFromUrl(url);
}

function loadImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function loadImageFromUrl(url) {
    loadImage(url);
}

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
        currentImage = img;
        displayImage(img);

        // Hide upload area, show canvas
        elements.uploadArea.style.display = 'none';
        elements.canvasWrapper.style.display = 'flex';
        elements.paletteContainer.style.display = 'flex';
        elements.clearBtn.style.display = 'block';

        extractPalette();
    };

    img.onerror = () => {
        showToast('Failed to load image. Check URL or CORS policy.');
    };

    img.src = src;
}

function displayImage(img) {
    const maxWidth = 800;
    const maxHeight = 500;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
}

function clearImage() {
    currentImage = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.uploadArea.style.display = 'flex';
    elements.canvasWrapper.style.display = 'none';
    elements.paletteContainer.style.display = 'none';
    elements.clearBtn.style.display = 'none';
    elements.fileInput.value = '';
    elements.urlInput.value = '';

    // Load default image again
    loadDefaultImage();
}

// ===== Canvas Interaction =====
function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    elements.magnifier.style.display = 'block';
    elements.magnifier.style.left = (e.clientX - rect.left - 60) + 'px';
    elements.magnifier.style.top = (e.clientY - rect.top - 60) + 'px';

    const imageData = ctx.getImageData(x, y, 1, 1);
    const pixel = imageData.data;

    const magnifierSize = 120;
    const zoomLevel = 10;
    const sourceSize = magnifierSize / zoomLevel;

    const magnifierCanvas = document.createElement('canvas');
    magnifierCanvas.width = magnifierSize;
    magnifierCanvas.height = magnifierSize;
    const magnifierCtx = magnifierCanvas.getContext('2d');

    magnifierCtx.imageSmoothingEnabled = false;
    magnifierCtx.drawImage(
        canvas,
        Math.max(0, x - sourceSize / 2),
        Math.max(0, y - sourceSize / 2),
        sourceSize,
        sourceSize,
        0,
        0,
        magnifierSize,
        magnifierSize
    );

    magnifierCtx.strokeStyle = '#6366f1';
    magnifierCtx.lineWidth = 2;
    magnifierCtx.beginPath();
    magnifierCtx.moveTo(magnifierSize / 2, 0);
    magnifierCtx.lineTo(magnifierSize / 2, magnifierSize);
    magnifierCtx.moveTo(0, magnifierSize / 2);
    magnifierCtx.lineTo(magnifierSize, magnifierSize / 2);
    magnifierCtx.stroke();

    elements.magnifier.style.backgroundImage = `url(${magnifierCanvas.toDataURL()})`;
    elements.magnifier.style.backgroundSize = 'cover';
}

function handleCanvasMouseLeave() {
    elements.magnifier.style.display = 'none';
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const imageData = ctx.getImageData(x, y, 1, 1);
    const pixel = imageData.data;

    currentColor = {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2]
    };

    updateColorDisplay();
}

// ===== Color Display =====
function updateColorDisplay() {
    const { r, g, b } = currentColor;
    const color = `rgb(${r}, ${g}, ${b})`;

    // Update color boxes
    elements.colorBox1.style.backgroundColor = color;
    elements.colorBox2.style.backgroundColor = color;

    // Update HEX
    const hex = rgbToHex(r, g, b);
    elements.hexValue.querySelector('.value-text').textContent = hex;

    // Update RGB
    const rgb = `rgb(${r}, ${g}, ${b})`;
    elements.rgbValue.querySelector('.value-text').textContent = rgb;

    // Update HSL
    const hsl = rgbToHsl(r, g, b);
    elements.hslValue.querySelector('.value-text').textContent = hsl;
}

// ===== Color Conversion Functions =====
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

// ===== Palette Extraction =====
function extractPalette() {
    if (!currentImage) return;

    const colors = extractDominantColors(paletteSize);

    elements.paletteGrid.innerHTML = '';

    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.setAttribute('data-color', color);

        colorDiv.addEventListener('click', () => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            currentColor = { r, g, b };
            updateColorDisplay();

            navigator.clipboard.writeText(color);
            showToast(`Copied ${color} to clipboard!`);
        });

        elements.paletteGrid.appendChild(colorDiv);
    });
}

function extractDominantColors(count) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = [];

    for (let i = 0; i < imageData.data.length; i += 40) {
        pixels.push([
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2]
        ]);
    }

    const clusters = kMeans(pixels, count);

    return clusters.map(cluster => {
        const r = Math.round(cluster[0]);
        const g = Math.round(cluster[1]);
        const b = Math.round(cluster[2]);
        return rgbToHex(r, g, b);
    });
}

function kMeans(pixels, k, maxIterations = 10) {
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice());
    }

    for (let iter = 0; iter < maxIterations; iter++) {
        const clusters = Array(k).fill(null).map(() => []);

        pixels.forEach(pixel => {
            let minDist = Infinity;
            let closestCentroid = 0;

            centroids.forEach((centroid, i) => {
                const dist = colorDistance(pixel, centroid);
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroid = i;
                }
            });

            clusters[closestCentroid].push(pixel);
        });

        centroids = clusters.map(cluster => {
            if (cluster.length === 0) return centroids[0];

            const sum = cluster.reduce((acc, pixel) => {
                return [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]];
            }, [0, 0, 0]);

            return [
                sum[0] / cluster.length,
                sum[1] / cluster.length,
                sum[2] / cluster.length
            ];
        });
    }

    return centroids;
}

function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
    );
}

// ===== Copy to Clipboard =====
function handleCopy(e) {
    const format = e.currentTarget.getAttribute('data-format');
    const valueElement = document.getElementById(`${format}Value`).querySelector('.value-text');
    const text = valueElement.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${text} to clipboard!`);
    });
}

// ===== Theme Toggle =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ===== Toast Notification =====
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', init);
