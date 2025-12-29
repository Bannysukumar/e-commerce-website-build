#!/bin/bash
# Fix .jpg files not being served through Nginx proxy

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"
PROXY_CONFIG="/www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf"

echo "=== 1. Check for any location blocks catching .jpg files ==="
grep -n "\.jpg\|\.jpeg\|location.*jpg" "$NGINX_CONFIG" "$PROXY_CONFIG" 2>/dev/null

echo ""
echo "=== 2. Check if image location block is still active ==="
grep -A 5 "location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)" "$NGINX_CONFIG"

echo ""
echo "=== 3. Check proxy configuration ==="
cat "$PROXY_CONFIG"

echo ""
echo "=== 4. Solution: Ensure .jpg files are proxied ==="
echo "The issue is that .jpg files aren't reaching Next.js through the proxy."
echo ""
echo "Possible fixes:"
echo "1. Ensure image location block is fully commented out"
echo "2. Add explicit location block for .jpg files to proxy"
echo "3. Check if there's a try_files directive interfering"

echo ""
echo "=== 5. Creating explicit .jpg proxy location ==="
# Check if we need to add a location block for .jpg files
if ! grep -q "location.*\.jpg" "$PROXY_CONFIG"; then
    echo "Adding explicit .jpg location block to proxy config..."
    # Create backup
    cp "$PROXY_CONFIG" "${PROXY_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Add location block for .jpg files before the catch-all location /
    sed -i '/^location \/ {/i\
location ~ \.jpg$ {\
    proxy_pass http://127.0.0.1:3000;\
    proxy_http_version 1.1;\
    proxy_set_header Host $host;\
    proxy_set_header X-Real-IP $remote_addr;\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
    proxy_set_header X-Forwarded-Proto $scheme;\
    expires 1y;\
    add_header Cache-Control "public, immutable";\
}\
' "$PROXY_CONFIG"
    
    echo "✅ Added .jpg location block"
else
    echo "⚠️  .jpg location block already exists"
fi

echo ""
echo "=== 6. Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    echo ""
    echo "=== 7. Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== 8. Testing logo.jpg ==="
    sleep 2
    curl -s -o /dev/null -w "HTTP %{http_code}\n" https://swebirdshop.com/logo.jpg
    echo ""
    if curl -s -o /dev/null -w "%{http_code}" https://swebirdshop.com/logo.jpg | grep -q "200"; then
        echo "✅ SUCCESS! logo.jpg is now working!"
    else
        echo "⚠️  Still not working. May need to check Next.js configuration."
    fi
else
    echo "❌ Nginx config has errors. Restoring backup..."
    LATEST_BACKUP=$(ls -t ${PROXY_CONFIG}.backup.* 2>/dev/null | head -1)
    if [ ! -z "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP" "$PROXY_CONFIG"
        echo "Backup restored"
    fi
fi

