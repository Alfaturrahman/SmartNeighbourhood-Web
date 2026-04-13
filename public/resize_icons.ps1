# Script untuk resize icon.png ke berbagai ukuran untuk iOS PWA
Add-Type -AssemblyName System.Drawing

$sourcePath = "icon.png"
$sizes = @(192, 180, 152, 120)

Write-Host "🎨 Resizing icon.png ke berbagai ukuran iOS..." -ForegroundColor Cyan

# Load source image
$sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath))
Write-Host "✅ Source: $($sourceImg.Width)x$($sourceImg.Height) pixels" -ForegroundColor Green

foreach ($size in $sizes) {
    $outputPath = "icon-$size.png"
    
    # Create new bitmap dengan ukuran target
    $destImg = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($destImg)
    
    # Set high quality untuk resize
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw resized image
    $graphics.DrawImage($sourceImg, 0, 0, $size, $size)
    
    # Save
    $destImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $destImg.Dispose()
    
    # Get file size
    $fileInfo = Get-Item $outputPath
    $fileSizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
    
    Write-Host "✅ Created: $outputPath ($size x $size, $fileSizeKB KB)" -ForegroundColor Green
}

# Cleanup source
$sourceImg.Dispose()

Write-Host "`n🎉 Selesai! Icon PNG untuk iOS sudah dibuat semua!" -ForegroundColor Cyan
Write-Host "`n📋 File yang dibuat:" -ForegroundColor Yellow
Get-ChildItem -Filter "icon-*.png" | Select-Object Name, @{Name="Size";Expression={"{0:N0} bytes" -f $_.Length}} | Format-Table -AutoSize
