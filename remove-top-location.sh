#!/bin/bash
# Remove the location block and comments from the top of Nginx config

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Current first 25 lines ==="
head -25 "$NGINX_CONFIG"

echo ""
echo "=== Removing lines 1-25 (location block and comments) ==="
# Find where the actual config starts (should be around line 25-30)
# Look for "server" or actual config directives
REAL_START=$(grep -n "^server\|^[[:space:]]*server\|^[[:space:]]*listen\|^[[:space:]]*root" "$NGINX_CONFIG" | head -1 | cut -d: -f1)

if [ ! -z "$REAL_START" ] && [ "$REAL_START" -gt 1 ]; then
    echo "Real config starts at line: $REAL_START"
    echo "Removing lines 1 to $((REAL_START-1))"
    
    # Create temp file with lines from REAL_START onwards
    tail -n +$REAL_START "$NGINX_CONFIG" > "${NGINX_CONFIG}.tmp"
    mv "${NGINX_CONFIG}.tmp" "$NGINX_CONFIG"
    
    echo "✅ Removed top $((REAL_START-1)) lines"
else
    echo "⚠️  Could not find where real config starts, removing first 25 lines manually"
    # Remove first 25 lines
    sed -i '1,25d' "$NGINX_CONFIG"
fi

echo ""
echo "=== First 10 lines after cleanup ==="
head -10 "$NGINX_CONFIG"

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config is now valid!"
    echo ""
    echo "Now you can add the .jpg location block correctly."
    echo "Run: ./fix-nginx-complete.sh (it will add the location block)"
else
    echo "❌ Still has errors"
    nginx -t 2>&1 | head -5
fi

