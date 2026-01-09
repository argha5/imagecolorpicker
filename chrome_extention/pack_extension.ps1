$version = "1.0.1"
$scriptPath = $PSScriptRoot
$zipName = Join-Path $scriptPath "ColorPickPro-v$version.zip"

# Define files relative to the script location
$filesToZip = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "icons",
    "assets"
)

# Remove existing zip if it exists
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Change to script directory to zip relative paths correctly
Push-Location $scriptPath
try {
    Compress-Archive -Path $filesToZip -DestinationPath $zipName -ErrorAction Stop
    Write-Host "✅ Extension packed into $zipName"
    Write-Host "You can now upload this file to the Chrome Web Store."
} catch {
    Write-Error "Failed to pack extension: $_"
} finally {
    Pop-Location
}
