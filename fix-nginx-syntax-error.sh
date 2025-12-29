#!/bin/bash
# Fix Nginx syntax error and check logo issue

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Checking line 26 for syntax error ==="
sed -n '20,30p' "$NGINX_CONFIG"

echo ""
echo "=== Checking for 'nginx' directive error ==="
grep -n "nginx" "$NGINX_CONFIG" | head -5

echo ""
echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Fixing syntax error ==="
# Remove any stray "nginx" directives
sed -i '/^[[:space:]]*nginx[[:space:]]*$/d' "$NGINX_CONFIG"
sed -i 's/nginx;//g' "$NGINX_CONFIG"

echo ""
echo "=== Checking image location block ==="
grep -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG" || echo "Image block not found or already commented"

echo ""
echo "=== Commenting out image location block if not already commented ==="
START_LINE=$(grep -n "^[[:space:]]*location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG" | head -1 | cut -d: -f1)
if [ ! -z "$START_LINE" ]; then
    sed -i "${START_LINE},$((START_LINE+4))s/^    /    # /" "$NGINX_CONFIG"
    echo "✅ Image location block commented out"
else
    echo "✅ Image location block already commented or not found"
fi

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    echo ""
    echo "=== Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== Testing logo access ==="
    sleep 2
    curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -5
else
    echo "❌ Still has errors. Showing around line 26:"
    sed -n '20,35p' "$NGINX_CONFIG"
fi

