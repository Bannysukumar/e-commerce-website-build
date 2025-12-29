#!/bin/bash
# Clean stray shell commands from Nginx config file

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Finding and removing stray shell commands ==="
# Remove lines that look like shell commands
sed -i '/^# If test passes, reload$/d' "$NGINX_CONFIG"
sed -i '/^\/etc\/init.d\/nginx reload$/d' "$NGINX_CONFIG"
sed -i '/^# Test logo$/d' "$NGINX_CONFIG"
sed -i '/curl -I https:\/\/swebirdshop.com\/logo.jpg/d' "$NGINX_CONFIG"
sed -i '/^nginx -t$/d' "$NGINX_CONFIG"
sed -i '/^# If test passes$/d' "$NGINX_CONFIG"

# Remove any lines that start with curl, nginx -t, or /etc/init.d
sed -i '/^[[:space:]]*curl/d' "$NGINX_CONFIG"
sed -i '/^[[:space:]]*nginx -t/d' "$NGINX_CONFIG"
sed -i '/^[[:space:]]*\/etc\/init.d\/nginx/d' "$NGINX_CONFIG"

# Remove empty lines that might have been left
sed -i '/^[[:space:]]*$/N;/^\n$/d' "$NGINX_CONFIG"

echo ""
echo "=== Checking around line 26 ==="
sed -n '20,35p' "$NGINX_CONFIG"

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid!"
    echo ""
    echo "=== Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== Testing logo access ==="
    sleep 2
    curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -5
    echo ""
    echo "✅ If you see HTTP/2 200, the logo is working!"
else
    echo "❌ Still has errors. Showing error details:"
    nginx -t 2>&1 | grep -A 5 "emerg"
fi

