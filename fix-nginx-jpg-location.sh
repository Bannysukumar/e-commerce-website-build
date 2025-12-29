#!/bin/bash
# Fix Nginx config - add .jpg location block in the correct place

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== 1. Check current config structure ==="
head -20 "$NGINX_CONFIG"

echo ""
echo "=== 2. Find the server block ==="
grep -n "server {" "$NGINX_CONFIG" | head -1

echo ""
echo "=== 3. Find where proxy include is ==="
grep -n "include.*proxy.*swebirdshop" "$NGINX_CONFIG"

echo ""
echo "=== 4. Check line 6 (where the error is) ==="
sed -n '1,10p' "$NGINX_CONFIG"

echo ""
echo "=== 5. The location block must be INSIDE the server block ==="
echo "Find the 'server {' line, then add the location block before the proxy include"

