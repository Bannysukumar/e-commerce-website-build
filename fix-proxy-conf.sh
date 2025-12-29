#!/bin/bash
# Fix proxy.conf syntax error

PROXY_CONFIG="/www/server/panel/vhost/nginx/proxy/swebirdshop.com/proxy.conf"

echo "=== Current proxy.conf ==="
cat "$PROXY_CONFIG"

echo ""
echo "=== The error says 'location' directive not allowed ==="
echo "This usually means proxy.conf is being included in the wrong context"
echo "or it's missing a server/location wrapper"

echo ""
echo "=== Checking how proxy.conf is included ==="
grep -n "include.*proxy.*swebirdshop" /www/server/panel/vhost/nginx/swebirdshop.com.conf

echo ""
echo "=== proxy.conf should be included inside a location block ==="
echo "The current proxy.conf has location blocks, which suggests"
echo "it might be included at the wrong level"

echo ""
echo "Note: If other static files work, the proxy is functioning."
echo "The logo.jpg 404 is likely a Next.js issue, not Nginx."

