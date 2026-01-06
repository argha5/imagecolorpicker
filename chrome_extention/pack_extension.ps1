$version = "1.0.0"
$zipName = "ColorPickPro-v$version.zip"
$sourcePath = "."
$exclude = @("*.zip", "*.ps1", "*.md", "SUMMARY.md", "INSTALLATION.md")

# Remove existing zip if it exists
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Create Zip
Compress-Archive -Path "manifest.json", "background.js", "content.js", "content.css", "popup.html", "popup.css", "popup.js", "icons" -DestinationPath $zipName

Write-Host "✅ Extension packed into $zipName"
Write-Host "You can now upload this file to the Chrome Web Store."
