#!/bin/bash
# Fix Nginx config by removing all location blocks outside server block

NGINX_CONFIG="/www/server/panel/vhost/nginx/swebirdshop.com.conf"

echo "=== Creating backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Checking line 74 (the error location) ==="
sed -n '70,80p' "$NGINX_CONFIG"

echo ""
echo "=== Finding server block boundaries ==="
# Find where server block starts
SERVER_START=$(grep -n "^server\|^[[:space:]]*server {" "$NGINX_CONFIG" | head -1 | cut -d: -f1)
echo "Server block starts at line: $SERVER_START"

# Find where server block ends (look for closing brace)
# Count opening and closing braces to find the matching one
if [ ! -z "$SERVER_START" ]; then
    echo "Analyzing server block structure..."
    
    # Get lines from server start to end of file
    tail -n +$SERVER_START "$NGINX_CONFIG" > /tmp/server_block.txt
    
    # Find the matching closing brace
    BRACE_COUNT=0
    LINE_NUM=0
    while IFS= read -r line; do
        LINE_NUM=$((LINE_NUM + 1))
        OPEN=$(echo "$line" | grep -o '{' | wc -l)
        CLOSE=$(echo "$line" | grep -o '}' | wc -l)
        BRACE_COUNT=$((BRACE_COUNT + OPEN - CLOSE))
        
        if [ $BRACE_COUNT -eq 0 ] && [ $LINE_NUM -gt 1 ]; then
            SERVER_END=$((SERVER_START + LINE_NUM - 1))
            echo "Server block ends at line: $SERVER_END"
            break
        fi
    done < /tmp/server_block.txt
    
    rm -f /tmp/server_block.txt
fi

echo ""
echo "=== Checking for location blocks outside server block ==="
# Check lines before server block
if [ ! -z "$SERVER_START" ] && [ "$SERVER_START" -gt 1 ]; then
    echo "Lines 1 to $((SERVER_START-1)) (before server block):"
    sed -n "1,$((SERVER_START-1))p" "$NGINX_CONFIG" | grep -n "location" || echo "No location blocks found"
fi

# Check lines after server block
if [ ! -z "$SERVER_END" ]; then
    TOTAL_LINES=$(wc -l < "$NGINX_CONFIG")
    if [ "$SERVER_END" -lt "$TOTAL_LINES" ]; then
        echo ""
        echo "Lines $((SERVER_END+1)) to $TOTAL_LINES (after server block):"
        sed -n "$((SERVER_END+1)),${TOTAL_LINES}p" "$NGINX_CONFIG" | grep -n "location" || echo "No location blocks found"
    fi
fi

echo ""
echo "=== Removing location blocks outside server block ==="
# Remove location blocks that are not inside server block
# Strategy: Keep only the server block and anything before it that's not a location block

# Create a new file with only valid content
TEMP_FILE="${NGINX_CONFIG}.new"
> "$TEMP_FILE"

INSIDE_SERVER=false
BRACE_COUNT=0
LOCATION_BLOCK=false
LOCATION_LINES=0

while IFS= read -r line; do
    # Check if we're entering server block
    if echo "$line" | grep -qE "^server|^[[:space:]]*server[[:space:]]*\{"; then
        INSIDE_SERVER=true
        BRACE_COUNT=1
        echo "$line" >> "$TEMP_FILE"
        continue
    fi
    
    # If inside server block, count braces
    if [ "$INSIDE_SERVER" = true ]; then
        OPEN=$(echo "$line" | grep -o '{' | wc -l)
        CLOSE=$(echo "$line" | grep -o '}' | wc -l)
        BRACE_COUNT=$((BRACE_COUNT + OPEN - CLOSE))
        
        # If we hit a location block outside server, skip it
        if echo "$line" | grep -qE "^[[:space:]]*location" && [ "$BRACE_COUNT" -le 0 ]; then
            LOCATION_BLOCK=true
            continue
        fi
        
        # If location block ends, reset flag
        if [ "$LOCATION_BLOCK" = true ] && echo "$line" | grep -qE "^[[:space:]]*\}"; then
            LOCATION_BLOCK=false
            continue
        fi
        
        # Skip lines in location block outside server
        if [ "$LOCATION_BLOCK" = true ]; then
            continue
        fi
        
        # If server block closes, we're done
        if [ "$BRACE_COUNT" -eq 0 ]; then
            echo "$line" >> "$TEMP_FILE"
            INSIDE_SERVER=false
            break
        fi
        
        echo "$line" >> "$TEMP_FILE"
    else
        # Before server block - only keep non-location lines
        if ! echo "$line" | grep -qE "^[[:space:]]*location"; then
            echo "$line" >> "$TEMP_FILE"
        fi
    fi
done < "$NGINX_CONFIG"

# Add remaining lines (after server block closes)
if [ "$INSIDE_SERVER" = false ]; then
    # Already handled
    :
fi

mv "$TEMP_FILE" "$NGINX_CONFIG"

echo "✅ Removed location blocks outside server block"

echo ""
echo "=== Testing Nginx configuration ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config is now valid!"
    echo ""
    echo "Now find the proxy include line and add the .jpg location block before it:"
    echo "  grep -n 'include.*proxy.*swebirdshop' $NGINX_CONFIG"
else
    echo "❌ Still has errors"
    nginx -t 2>&1 | head -10
    echo ""
    echo "Let's try a simpler approach - manually check line 74:"
    sed -n '70,80p' "$NGINX_CONFIG"
fi

