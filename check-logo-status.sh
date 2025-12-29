#!/bin/bash
# Check actual HTTP status for logo

echo "=== 1. Test logo on localhost (full response) ==="
curl -v http://localhost:3000/logo.jpg 2>&1 | grep -E "HTTP|Content-Type|Content-Length|<"

echo ""
echo "=== 2. Test logo via domain (full response) ==="
curl -v https://swebirdshop.com/logo.jpg 2>&1 | grep -E "HTTP|Content-Type|Content-Length|<|x-powered"

echo ""
echo "=== 3. Test with full headers ==="
echo "Localhost:"
curl -I http://localhost:3000/logo.jpg 2>&1
echo ""
echo "Domain:"
curl -I https://swebirdshop.com/logo.jpg 2>&1

echo ""
echo "=== 4. Test if Next.js is actually running ==="
curl -I http://localhost:3000/ 2>&1 | head -3

echo ""
echo "=== 5. Check PM2 logs for errors ==="
pm2 logs swebirdshop --lines 5 --nostream | tail -10

echo ""
echo "=== 6. Test other static files for comparison ==="
echo "icon.svg on localhost:"
curl -I http://localhost:3000/icon.svg 2>&1 | head -3
echo ""
echo "icon.svg via domain:"
curl -I https://swebirdshop.com/icon.svg 2>&1 | head -3

