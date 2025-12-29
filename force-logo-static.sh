#!/bin/bash
# Force Next.js to serve logo.jpg as static file

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== Issue: Next.js treating /logo.jpg as route instead of static file ==="
echo "This happens when accessed via domain but works on localhost"
echo ""

echo "=== Solution 1: Check if there's a route conflict ==="
if [ -f "app/logo.jpg/page.tsx" ] || [ -f "app/logo/page.tsx" ]; then
    echo "⚠️  Found route that might conflict"
    find app -name "*logo*" -type f
else
    echo "✅ No route conflicts found"
fi

echo ""
echo "=== Solution 2: Test with different filename ==="
if [ -f "public/logo.jpg" ]; then
    echo "Creating logo-image.jpg as alternative..."
    cp public/logo.jpg public/logo-image.jpg
    echo "Test: curl -I http://localhost:3000/logo-image.jpg"
    curl -I http://localhost:3000/logo-image.jpg 2>&1 | head -3
    echo ""
    echo "If logo-image.jpg works, we can update the code to use it"
fi

echo ""
echo "=== Solution 3: Check Next.js publicPath configuration ==="
echo "Checking next.config.mjs:"
cat next.config.mjs

echo ""
echo "=== Solution 4: Try accessing with query parameter ==="
echo "Sometimes Next.js serves static files differently with query params"
curl -I "http://localhost:3000/logo.jpg?v=1" 2>&1 | head -3
curl -I "https://swebirdshop.com/logo.jpg?v=1" 2>&1 | head -3

echo ""
echo "=== Solution 5: Check if it's a Host header issue ==="
echo "Testing with explicit Host header:"
curl -I -H "Host: swebirdshop.com" http://localhost:3000/logo.jpg 2>&1 | head -3

echo ""
echo "=== Solution 6: Check PM2 environment variables ==="
pm2 describe swebirdshop | grep -E "env|NODE_ENV|NEXT_PUBLIC"

echo ""
echo "=== Recommendation ==="
echo "Since logo.jpg works on localhost but not via domain,"
echo "and Next.js returns a 404 page (not file not found),"
echo "this suggests Next.js is treating it as a route."
echo ""
echo "Try:"
echo "1. Use a different filename (logo-image.jpg)"
echo "2. Or check if there's a middleware/routing issue"
echo "3. Or ensure the public directory is properly configured"

