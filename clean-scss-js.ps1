# PowerShell script to clean SCSS and JS files
# Removes comments and redundant code

$cssJsFiles = Get-ChildItem -Path "." -Include "*.scss", "*.js" -Recurse

foreach ($file in $cssJsFiles) {
    Write-Host "Cleaning file: $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove block comments (/* */) - works for both CSS/SCSS and JS
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    
    # Remove single line comments (//) - works for both CSS/SCSS and JS
    $content = $content -replace '//.*$', '' -replace '(?m)^\s*//.*$', ''
    
    # Remove empty lines or lines with just whitespace (multiple passes)
    $content = $content -replace '(?m)^\s*$\n', ''
    $content = $content -replace '(?m)^\s*$\n', ''
    
    # Clean up consecutive blank lines
    $content = $content -replace '(\r?\n){3,}', "`$1`$1"
    
    # Write cleaned content back to file
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Cleaned: $($file.FullName)"
}

Write-Host "All SCSS and JS files have been cleaned."
