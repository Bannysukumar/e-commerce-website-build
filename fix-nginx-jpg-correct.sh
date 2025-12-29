#!/bin/bash
# Fix Nginx config - remove location block from top level and add it correctly

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== 1. Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== 2. Check current structure (first 25 lines) ==="
head -25 "$NGINX_CONFIG"

echo ""
echo "=== 3. Find server block (checking for 'server' with or without space) ==="
grep -n "^server\|^[[:space:]]*server" "$NGINX_CONFIG" | head -5

echo ""
echo "=== 4. Remove location block from top level (lines 1-15) ==="
# Remove the location block that's outside server block
sed -i '/^[[:space:]]*location ~ \\.jpg$/,/^[[:space:]]*}$/d' "$NGINX_CONFIG"

echo ""
echo "=== 5. Find proxy include line ==="
PROXY_LINE=$(grep -n "include.*proxy.*swebirdshop" "$NGINX_CONFIG" | grep -v "^#" | head -1 | cut -d: -f1)
echo "Proxy include at line: $PROXY_LINE"

if [ ! -z "$PROXY_LINE" ]; then
    echo ""
    echo "=== 6. Add .jpg location block BEFORE proxy include (line $PROXY_LINE) ==="
    # Add location block before the proxy include
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
    
    echo "✅ Added .jpg location block before proxy include"
else
    echo "❌ Could not find proxy include line"
    exit 1
fi

echo ""
echo "=== 7. Verify the change (around proxy include) ==="
sed -n "$((PROXY_LINE-5)),$((PROXY_LINE+2))p" "$NGINX_CONFIG"

echo ""
echo "=== 8. Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid!"
    echo ""
    echo "=== 9. Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== 10. Testing logo.jpg ==="
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

