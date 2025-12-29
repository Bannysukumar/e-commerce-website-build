#!/bin/bash
# Debug why logo returns 404 via domain but works on localhost

echo "=== 1. Check Nginx config errors ==="
nginx -t 2>&1

echo ""
echo "=== 2. Check if image location block is still active ==="
grep -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" /www/server/panel/vhost/nginx/swebirdshop.com.conf

echo ""
echo "=== 3. Check Nginx proxy config ==="
cat /www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf

echo ""
echo "=== 4. Test with verbose curl to see what's happening ==="
curl -v https://swebirdshop.com/logo.jpg 2>&1 | grep -E "HTTP|location|server|x-powered"

echo ""
echo "=== 5. Check if request reaches Next.js ==="
curl -I https://swebirdshop.com/logo.jpg 2>&1 | grep -i "x-powered-by"

echo ""
echo "=== 6. Test other static files to see if it's logo-specific ==="
echo "Testing icon.svg:"
curl -I https://swebirdshop.com/icon.svg 2>&1 | head -3
echo ""
echo "Testing placeholder.svg:"
curl -I https://swebirdshop.com/placeholder.svg 2>&1 | head -3

echo ""
echo "=== 7. Check Nginx access logs (if available) ==="
tail -5 /www/wwwlogs/swebirdshop.com.log 2>/dev/null || echo "Log file not accessible"

echo ""
echo "=== 8. Check if there's a try_files directive catching it ==="
grep -n "try_files" /www/server/panel/vhost/nginx/swebirdshop.com.conf /www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf 2>/dev/null

echo ""
echo "=== 9. Test direct IP to bypass domain ==="
curl -I http://185.216.203.209:3000/logo.jpg 2>&1 | head -3

