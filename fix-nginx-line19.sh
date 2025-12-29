#!/bin/bash
# Fix Nginx syntax error on line 19

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Checking lines 15-25 for syntax error ==="
sed -n '15,25p' "$NGINX_CONFIG"

echo ""
echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Checking for missing 'server' directive before '{' ==="
# Check if line 19 has a '{' without a proper directive before it
LINE19=$(sed -n '19p' "$NGINX_CONFIG")
echo "Line 19: $LINE19"

# Check if there's a 'server {' missing
if echo "$LINE19" | grep -q "^{"; then
    LINE18=$(sed -n '18p' "$NGINX_CONFIG")
    echo "Line 18: $LINE18"
    
    if ! echo "$LINE18" | grep -q "server"; then
        echo "⚠️  Missing 'server' directive before '{'"
        echo "Adding 'server' directive..."
        sed -i '18a\server' "$NGINX_CONFIG"
    fi
fi

echo ""
echo "=== Checking for duplicate or malformed server block ==="
grep -n "server" "$NGINX_CONFIG" | head -5

echo ""
echo "=== Updated lines 15-25 ==="
sed -n '15,25p' "$NGINX_CONFIG"

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
else
    echo "❌ Still has errors. Please check the config manually:"
    echo "  nano $NGINX_CONFIG"
    echo ""
    echo "Look for:"
    echo "  - Missing 'server' directive before '{'"
    echo "  - Duplicate 'server' blocks"
    echo "  - Unclosed braces"
fi

