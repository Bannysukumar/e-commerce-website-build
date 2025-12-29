#!/bin/bash
# Verify logo file on server and fix Next.js serving issue

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== 1. Verify logo file exists ==="
if [ -f "public/logo.jpg" ]; then
    echo "✅ Logo file exists at: public/logo.jpg"
    ls -lh public/logo.jpg
    echo ""
    echo "Full path: $(pwd)/public/logo.jpg"
else
    echo "❌ Logo file NOT found at: public/logo.jpg"
    echo "Current directory: $(pwd)"
    echo "Files in public/:"
    ls -la public/ | head -10
    exit 1
fi

echo ""
echo "=== 2. Test Next.js serving (localhost) ==="
curl -I http://localhost:3000/logo.jpg 2>&1 | head -5

echo ""
echo "=== 3. Check Next.js static file serving ==="
# Next.js serves files from public/ directory
# Files in public/ should be accessible at root URL: /filename

echo ""
echo "=== 4. Verify PM2 working directory ==="
pm2 describe swebirdshop | grep -E "cwd|exec cwd"

echo ""
echo "=== 5. Check if Next.js can access the file ==="
# Test from Node.js perspective
node -e "
const fs = require('fs');
const path = require('path');
const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
console.log('Current working directory:', process.cwd());
console.log('Logo path:', logoPath);
console.log('File exists:', fs.existsSync(logoPath));
if (fs.existsSync(logoPath)) {
    const stats = fs.statSync(logoPath);
    console.log('File size:', stats.size, 'bytes');
    console.log('File readable:', fs.constants.R_OK ? 'Yes' : 'No');
}
"

echo ""
echo "=== 6. List all files in public/ directory ==="
ls -lh public/ | grep -E "logo|jpg|png|svg" | head -10

echo ""
echo "=== 7. Test other static files ==="
echo "Testing icon.svg:"
curl -I http://localhost:3000/icon.svg 2>&1 | head -3 || echo "icon.svg not accessible"

echo ""
echo "=== 8. Check Next.js build output ==="
if [ -d ".next" ]; then
    echo "Next.js build exists"
    ls -la .next/static/ 2>/dev/null | head -5 || echo "No static files in .next/static/"
else
    echo "⚠️  No .next directory - need to build"
fi

