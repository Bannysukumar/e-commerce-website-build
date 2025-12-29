#!/bin/bash
# Fix logo.jpg 404 issue - Next.js specific

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== 1. Verify logo file exists and check permissions ==="
ls -lh public/logo.jpg
file public/logo.jpg

echo ""
echo "=== 2. Check if Next.js can see the file ==="
node -e "
const fs = require('fs');
const path = require('path');
const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
console.log('Current directory:', process.cwd());
console.log('Logo path:', logoPath);
console.log('File exists:', fs.existsSync(logoPath));
if (fs.existsSync(logoPath)) {
    const stats = fs.statSync(logoPath);
    console.log('File size:', stats.size);
    console.log('File readable:', (stats.mode & parseInt('444', 8)) ? 'Yes' : 'No');
    console.log('File permissions:', (stats.mode & parseInt('777', 8)).toString(8));
}
"

echo ""
echo "=== 3. Check if other .jpg files work ==="
echo "Testing placeholder.jpg:"
curl -I http://localhost:3000/placeholder.jpg 2>&1 | head -3
echo ""
echo "Testing logo.jpg on localhost:"
curl -I http://localhost:3000/logo.jpg 2>&1 | head -3

echo ""
echo "=== 4. List all files in public/ directory ==="
ls -la public/ | grep -E "\.jpg|\.jpeg|\.png" | head -10

echo ""
echo "=== 5. Check Next.js build for static files ==="
if [ -d ".next" ]; then
    echo "Checking .next/static files:"
    find .next/static -name "*logo*" 2>/dev/null | head -5
else
    echo "No .next directory found"
fi

echo ""
echo "=== 6. Try copying logo to a different name to test ==="
if [ -f "public/logo.jpg" ]; then
    cp public/logo.jpg public/test-logo.jpg
    echo "Created test-logo.jpg, testing:"
    curl -I http://localhost:3000/test-logo.jpg 2>&1 | head -3
    echo ""
    echo "If test-logo.jpg works, there might be a filename issue"
fi

echo ""
echo "=== 7. Check if there's a case sensitivity issue ==="
ls -la public/ | grep -i logo

echo ""
echo "=== 8. Rebuild Next.js to ensure logo is included ==="
echo "This will take a moment..."
rm -rf .next
PATH="/usr/bin:$PATH" npm run build 2>&1 | tail -10

echo ""
echo "=== 9. Restart PM2 and test ==="
pm2 restart swebirdshop
sleep 5
curl -I http://localhost:3000/logo.jpg 2>&1 | head -3
curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -3

