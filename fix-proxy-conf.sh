#!/bin/bash
# Fix the proxy.conf file - location blocks must be inside server block

PROXY_CONF="/www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf"

echo "=== Creating backup ==="
cp "$PROXY_CONF" "${PROXY_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Current proxy.conf content ==="
cat "$PROXY_CONF"

echo ""
echo "=== Checking first 10 lines ==="
head -10 "$PROXY_CONF"

echo ""
echo "=== The issue ==="
echo "proxy.conf is included INSIDE the server block, so location blocks are valid here."
echo "But if there's a location block at line 1, it might be malformed."
echo ""

# Check if the file starts with a location block
FIRST_LINE=$(head -1 "$PROXY_CONF")
if echo "$FIRST_LINE" | grep -q "location"; then
    echo "⚠️  First line contains 'location'"
    echo "First line: $FIRST_LINE"
    
    # Check if it's properly formatted
    if ! echo "$FIRST_LINE" | grep -qE "^[[:space:]]*location"; then
        echo "❌ Location block is not properly indented or formatted"
        echo ""
        echo "=== Removing malformed location block at top ==="
        # Find where the location block ends
        BRACE_COUNT=0
        END_LINE=1
        for i in $(seq 1 20); do
            LINE=$(sed -n "${i}p" "$PROXY_CONF")
            if [ -z "$LINE" ]; then
                break
            fi
            OPEN=$(echo "$LINE" | grep -o '{' | wc -l)
            CLOSE=$(echo "$LINE" | grep -o '}' | wc -l)
            BRACE_COUNT=$((BRACE_COUNT + OPEN - CLOSE))
            
            if [ $BRACE_COUNT -eq 0 ] && [ $i -gt 1 ]; then
                END_LINE=$i
                break
            fi
        done
        
        echo "Removing lines 1 to $END_LINE"
        sed -i "1,${END_LINE}d" "$PROXY_CONF"
        
        echo "✅ Removed malformed location block"
    else
        echo "✅ Location block looks properly formatted"
    fi
fi

echo ""
echo "=== Checking if file is empty or has issues ==="
if [ ! -s "$PROXY_CONF" ]; then
    echo "⚠️  File is empty, creating default proxy config"
    cat > "$PROXY_CONF" << 'EOF'
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    expires -1;
}

location /_next/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
EOF
    echo "✅ Created default proxy config"
fi

echo ""
echo "=== Final proxy.conf content ==="
cat "$PROXY_CONF"

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config is now valid!"
    echo ""
    echo "=== Reloading Nginx ==="
    /etc/init.d/nginx reload
    echo ""
    echo "=== Testing logo.jpg ==="
    sleep 2
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://swebirdshop.com/logo.jpg)
    echo "HTTP Status: $STATUS"
    
    if [ "$STATUS" = "200" ]; then
        echo "✅ SUCCESS! logo.jpg is now working!"
    else
        echo "⚠️  Still returning $STATUS"
        echo "Checking response:"
        curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -10
    fi
else
    echo "❌ Still has errors"
    nginx -t 2>&1 | head -10
fi

