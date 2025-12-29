#!/bin/bash
# Final fix: Add .jpg location block INSIDE server block, before it closes

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== 1. Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== 2. Remove any existing .jpg location blocks from top level ==="
# Remove location blocks from first 50 lines (outside server block)
sed -i '1,50{/^[[:space:]]*location ~ \\.jpg$/,/^[[:space:]]*}$/d;}' "$NGINX_CONFIG"

echo ""
echo "=== 3. Find server block structure ==="
SERVER_START=$(grep -n "^server\|^[[:space:]]*server" "$NGINX_CONFIG" | head -1 | cut -d: -f1)
echo "Server block starts at line: $SERVER_START"

# Find the proxy include line
PROXY_INCLUDE=$(grep -n "include.*proxy.*swebirdshop" "$NGINX_CONFIG" | grep -v "^[[:space:]]*#" | tail -1 | cut -d: -f1)
echo "Proxy include at line: $PROXY_INCLUDE"

# Check what's around the proxy include
echo ""
echo "Lines around proxy include:"
sed -n "$((PROXY_INCLUDE-3)),$((PROXY_INCLUDE+5))p" "$NGINX_CONFIG"

echo ""
echo "=== 4. The location block must be BEFORE the closing brace ==="
echo "If the include is followed by }, we need to add location block before the include"
echo "Let's add it right before the proxy include line"

# Add location block before proxy include (which should be inside server block)
sed -i "${PROXY_INCLUDE}i\\
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

echo "✅ Added .jpg location block before proxy include (line $PROXY_INCLUDE)"

echo ""
echo "=== 5. Verify the change ==="
sed -n "$((PROXY_INCLUDE-2)),$((PROXY_INCLUDE+12))p" "$NGINX_CONFIG"

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
    echo "❌ Nginx config has errors. Checking what's wrong..."
    nginx -t 2>&1 | head -10
    echo ""
    echo "The location block might be outside the server block."
    echo "Let's check the structure:"
    echo "Server block start: line $SERVER_START"
    echo "Proxy include: line $PROXY_INCLUDE"
    echo ""
    echo "Checking if there's a closing brace before the include:"
    sed -n "$SERVER_START,$PROXY_INCLUDEp" "$NGINX_CONFIG" | grep -n "^}"
fi

