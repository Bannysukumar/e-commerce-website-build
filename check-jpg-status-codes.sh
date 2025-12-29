#!/bin/bash
# Check actual HTTP status codes for .jpg files

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== Testing .jpg files with full HTTP status ==="
echo ""

echo "1. logo.jpg:"
echo "   Localhost:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/logo.jpg
echo "   Domain:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://swebirdshop.com/logo.jpg

echo ""
echo "2. placeholder.jpg:"
echo "   Localhost:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/placeholder.jpg
echo "   Domain:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://swebirdshop.com/placeholder.jpg

echo ""
echo "3. icon.svg (for comparison):"
echo "   Localhost:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/icon.svg
echo "   Domain:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://swebirdshop.com/icon.svg

echo ""
echo "=== If all .jpg return 404 via domain but 200 on localhost, ==="
echo "this confirms Next.js isn't serving .jpg files through the proxy."
echo ""
echo "This could be due to:"
echo "1. Nginx proxy configuration issue"
echo "2. Next.js static file serving issue with .jpg extension"
echo "3. Content-Type handling issue"

