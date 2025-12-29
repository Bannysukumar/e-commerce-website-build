#!/bin/bash
# Simple fix: Add .jpg location block at line 115 (known correct location)

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== 1. Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== 2. Remove any existing .jpg location blocks from top level ==="
# Remove location blocks that are outside server block (first 50 lines)
sed -i '1,50{/^[[:space:]]*location ~ \\.jpg$/,/^[[:space:]]*}$/d;}' "$NGINX_CONFIG"

echo ""
echo "=== 3. Check current config around line 115 ==="
sed -n '110,120p' "$NGINX_CONFIG"

echo ""
echo "=== 4. Add .jpg location block before line 115 ==="
# Line 115 is the proxy include, add location block before it
sed -i '115i\
    location ~ \\.jpg$ {\
        proxy_pass http://127.0.0.1:3000;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
' "$NGINX_CONFIG"

echo "✅ Added .jpg location block before line 115"

echo ""
echo "=== 5. Verify the change ==="
sed -n '110,125p' "$NGINX_CONFIG"

echo ""
echo "=== 6. Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid!"
    echo ""
    echo "=== 7. Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== 8. Testing logo.jpg ==="
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
    echo "❌ Nginx config has errors. Restoring backup..."
    LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* 2>/dev/null | head -1)
    if [ ! -z "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP" "$NGINX_CONFIG"
        echo "Backup restored from: $LATEST_BACKUP"
    fi
    echo ""
    echo "Showing error:"
    nginx -t 2>&1 | head -10
fi

