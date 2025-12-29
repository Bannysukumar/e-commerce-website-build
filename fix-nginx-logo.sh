#!/bin/bash
# Fix Nginx configuration to serve logo properly

echo "=== 1. Check Nginx proxy configuration ==="
cat /www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf

echo ""
echo "=== 2. Check main Nginx config for static file blocks ==="
grep -A 10 "location.*\.(jpg\|png\|gif\|svg\|jpeg)" /www/server/panel/vhost/nginx/swebirdshop.com.conf 2>/dev/null || echo "No static file location blocks found"

echo ""
echo "=== 3. Test if Nginx is caching the 404 ==="
# Clear Nginx cache
rm -rf /var/cache/nginx/* 2>/dev/null || true
nginx -s reload 2>/dev/null || /etc/init.d/nginx reload

echo ""
echo "=== 4. Test logo with cache-busting ==="
curl -I "https://swebirdshop.com/logo.jpg?t=$(date +%s)" 2>&1 | head -5

echo ""
echo "=== 5. Check if there's a try_files directive interfering ==="
grep -n "try_files" /www/server/panel/vhost/nginx/swebirdshop.com.conf /www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf 2>/dev/null

echo ""
echo "=== 6. Test direct IP access (bypassing domain) ==="
curl -I "http://185.216.203.209:3000/logo.jpg" 2>&1 | head -5

