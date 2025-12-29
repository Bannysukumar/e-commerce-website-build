#!/bin/bash
# Simple fix: Check and remove location block at line 74

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Checking lines 70-80 ==="
sed -n '70,80p' "$NGINX_CONFIG"

echo ""
echo "=== Checking if line 74 is a location block ==="
LINE74=$(sed -n '74p' "$NGINX_CONFIG")
echo "Line 74: $LINE74"

if echo "$LINE74" | grep -q "location"; then
    echo "⚠️  Line 74 contains 'location' - this is the problem"
    echo ""
    echo "=== Finding the full location block ==="
    # Find where the location block starts and ends
    START_LINE=74
    END_LINE=74
    
    # Go backwards to find the start
    for i in $(seq 74 -1 1); do
        LINE=$(sed -n "${i}p" "$NGINX_CONFIG")
        if echo "$LINE" | grep -qE "^[[:space:]]*location"; then
            START_LINE=$i
            break
        fi
    done
    
    # Go forwards to find the end (look for closing brace)
    BRACE_COUNT=0
    for i in $(seq $START_LINE 200); do
        LINE=$(sed -n "${i}p" "$NGINX_CONFIG")
        if [ -z "$LINE" ]; then
            break
        fi
        OPEN=$(echo "$LINE" | grep -o '{' | wc -l)
        CLOSE=$(echo "$LINE" | grep -o '}' | wc -l)
        BRACE_COUNT=$((BRACE_COUNT + OPEN - CLOSE))
        
        if [ $BRACE_COUNT -eq 0 ] && [ $i -gt $START_LINE ]; then
            END_LINE=$i
            break
        fi
    done
    
    echo "Location block spans lines $START_LINE to $END_LINE"
    echo ""
    echo "=== Location block content ==="
    sed -n "${START_LINE},${END_LINE}p" "$NGINX_CONFIG"
    
    echo ""
    echo "=== Removing this location block ==="
    # Remove the lines
    sed -i "${START_LINE},${END_LINE}d" "$NGINX_CONFIG"
    
    echo "✅ Removed lines $START_LINE to $END_LINE"
else
    echo "Line 74 doesn't contain 'location' - checking context"
    echo ""
    echo "=== Checking 5 lines before and after ==="
    sed -n '69,79p' "$NGINX_CONFIG"
fi

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config is now valid!"
    echo ""
    echo "Now you can add the .jpg location block correctly inside the server block."
    echo "Find the proxy include line:"
    echo "  grep -n 'include.*proxy.*swebirdshop' $NGINX_CONFIG"
    echo ""
    echo "Then add the location block BEFORE that line."
else
    echo "❌ Still has errors"
    nginx -t 2>&1 | head -5
fi

