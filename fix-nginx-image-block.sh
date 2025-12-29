#!/bin/bash
# Fix Nginx image location block that's intercepting logo.jpg

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Current image location block ==="
grep -B 2 -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG"

echo ""
echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "Backup created"

echo ""
echo "=== Commenting out the image location block ==="
# Find the line numbers for the image location block
START_LINE=$(grep -n "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG" | head -1 | cut -d: -f1)
if [ ! -z "$START_LINE" ]; then
    # Comment out the block (usually 5 lines: location, {, expires, error_log, access_log, })
    sed -i "${START_LINE},$((START_LINE+4))s/^    /    # /" "$NGINX_CONFIG"
    echo "✅ Image location block commented out (lines $START_LINE-$((START_LINE+4)))"
else
    echo "⚠️  Could not find image location block"
fi

echo ""
echo "=== Updated image location block ==="
grep -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG" || echo "✅ Block commented out successfully"

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    echo ""
    echo "=== Reloading Nginx ==="
    /etc/init.d/nginx reload || nginx -s reload
    echo ""
    echo "=== Testing logo access ==="
    sleep 2
    curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -5
    echo ""
    echo "✅ If you see HTTP/2 200, the logo is now working!"
else
    echo "❌ Nginx config has errors. Restoring backup..."
    LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* 2>/dev/null | head -1)
    if [ ! -z "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP" "$NGINX_CONFIG"
        echo "Backup restored from: $LATEST_BACKUP"
    fi
fi

