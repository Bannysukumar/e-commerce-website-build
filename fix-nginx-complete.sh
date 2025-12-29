#!/bin/bash
# Complete fix: Remove location block from line 6, add it correctly

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== 1. Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== 2. Show first 20 lines (to see the problematic location block) ==="
head -20 "$NGINX_CONFIG"

echo ""
echo "=== 3. Remove location block from top (lines 1-20) ==="
# Remove any location blocks in the first 20 lines
sed -i '1,20{/location ~ \\.jpg$/,/^[[:space:]]*}$/d;}' "$NGINX_CONFIG"

echo ""
echo "=== 4. Verify removal (first 10 lines after cleanup) ==="
head -10 "$NGINX_CONFIG"

echo ""
echo "=== 5. Find proxy include line (should be around 115) ==="
PROXY_LINE=$(grep -n "include.*proxy.*swebirdshop" "$NGINX_CONFIG" | grep -v "^[[:space:]]*#" | tail -1 | cut -d: -f1)
echo "Proxy include at line: $PROXY_LINE"

if [ -z "$PROXY_LINE" ]; then
    echo "❌ Could not find proxy include line"
    exit 1
fi

echo ""
echo "=== 6. Check structure around proxy include ==="
sed -n "$((PROXY_LINE-5)),$((PROXY_LINE+3))p" "$NGINX_CONFIG"

echo ""
echo "=== 7. Add .jpg location block before proxy include ==="
sed -i "${PROXY_LINE}i\\
    location ~ \\.jpg\$ {\\
        proxy_pass http://127.0.0.1:3000;\\
        proxy_http_version 1.1;\\
        proxy_set_header Host \$host;\\
        proxy_set_header X-Real-IP \$remote_addr;\\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\
        proxy_set_header X-Forwarded-Proto \$scheme;\\
        expires 1y;\\
        add_header Cache-Control \"public, immutable\";\\
    }\\
" "$NGINX_CONFIG"

echo "✅ Added location block before line $PROXY_LINE"

echo ""
echo "=== 8. Verify final structure ==="
sed -n "$((PROXY_LINE-3)),$((PROXY_LINE+12))p" "$NGINX_CONFIG"

echo ""
echo "=== 9. Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid!"
    echo ""
    echo "=== 10. Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== 11. Testing logo.jpg ==="
    sleep 2
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://swebirdshop.com/logo.jpg)
    echo "HTTP Status: $STATUS"
    
    if [ "$STATUS" = "200" ]; then
        echo "✅ SUCCESS! logo.jpg is now working!"
    else
        echo "⚠️  Still returning $STATUS"
        curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -5
    fi
else
    echo "❌ Nginx config still has errors"
    nginx -t 2>&1 | head -10
    echo ""
    echo "The location block at line 6 might still exist."
    echo "Please manually edit the file to remove it:"
    echo "  nano $NGINX_CONFIG"
    echo "  Delete lines 1-20 that contain the location block"
fi

