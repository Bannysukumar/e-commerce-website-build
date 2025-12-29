#!/bin/bash
# Verify logo is now working after Nginx fix

echo "=== 1. Test logo on localhost (Next.js) ==="
curl -I http://localhost:3000/logo.jpg 2>&1 | head -5

echo ""
echo "=== 2. Test logo via domain (through Nginx proxy) ==="
curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -5

echo ""
echo "=== 3. Check Nginx config is valid ==="
nginx -t 2>&1 | grep -E "syntax is ok|test is successful" && echo "✅ Nginx config is valid" || echo "⚠️  Nginx config has issues"

echo ""
echo "=== 4. Verify logo file exists ==="
ls -lh /www/wwwroot/swebirdshop.com/e-commerce-website-build/public/logo.jpg

echo ""
echo "=== 5. Check PM2 is running ==="
pm2 status swebirdshop | grep -E "online|stopped"

echo ""
if curl -I https://swebirdshop.com/logo.jpg 2>&1 | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    echo "✅ SUCCESS! Logo is working via domain!"
else
    echo "⚠️  Logo still returning 404. Check the output above."
fi

