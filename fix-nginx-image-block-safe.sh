#!/bin/bash
# Fix Nginx image location block that's intercepting logo.jpg (safe version)

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"
PROXY_CONFIG="/www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf"

echo "=== Checking for existing Nginx errors ==="
nginx -t 2>&1 | head -10

echo ""
echo "=== Current image location block ==="
grep -B 2 -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG"

echo ""
echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "Backup created"

echo ""
echo "=== Commenting out the image location block ==="
# Find the line number for the image location block
START_LINE=$(grep -n "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG" | head -1 | cut -d: -f1)
if [ ! -z "$START_LINE" ]; then
    # Comment out 5 lines (location, {, expires, error_log, access_log, })
    sed -i "${START_LINE},$((START_LINE+4))s/^    /    # /" "$NGINX_CONFIG"
    echo "✅ Image location block commented out (lines $START_LINE-$((START_LINE+4)))"
else
    echo "⚠️  Could not find image location block - it may already be commented out"
fi

echo ""
echo "=== Updated image location block ==="
grep -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG" || echo "✅ Block commented out successfully"

echo ""
echo "=== Testing only the main config file ==="
# Test if our changes are valid by checking syntax of just this file
nginx -t -c "$NGINX_CONFIG" 2>&1 || echo "Note: Testing individual file may show errors, but main nginx -t will check all files"

echo ""
echo "=== Testing full Nginx configuration ==="
FULL_TEST=$(nginx -t 2>&1)
echo "$FULL_TEST"

if echo "$FULL_TEST" | grep -q "syntax is ok\|test is successful"; then
    echo ""
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
    echo ""
    echo "⚠️  Nginx config has errors, but they may be in other files"
    echo "Checking if the error is in the file we edited..."
    
    if echo "$FULL_TEST" | grep -q "$NGINX_CONFIG"; then
        echo "❌ Error is in the file we edited. Restoring backup..."
        LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* 2>/dev/null | head -1)
        if [ ! -z "$LATEST_BACKUP" ]; then
            cp "$LATEST_BACKUP" "$NGINX_CONFIG"
            echo "Backup restored from: $LATEST_BACKUP"
        fi
    else
        echo "✅ Error is NOT in the file we edited (likely in proxy.conf)"
        echo "The image block has been commented out successfully."
        echo "You may need to fix the proxy.conf error separately, but the logo fix is applied."
        echo ""
        echo "To manually test, try reloading nginx anyway:"
        echo "  /etc/init.d/nginx reload"
    fi
fi

