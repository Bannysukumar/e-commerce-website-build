#!/bin/bash
# Test all .jpg files to see if it's a general .jpg issue or logo-specific

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== Testing all .jpg files on localhost ==="
for file in public/*.jpg; do
    filename=$(basename "$file")
    echo ""
    echo "Testing $filename on localhost:"
    curl -I http://localhost:3000/$filename 2>&1 | head -3
done

echo ""
echo "=== Testing all .jpg files via domain ==="
for file in public/*.jpg; do
    filename=$(basename "$file")
    echo ""
    echo "Testing $filename via domain:"
    curl -I https://swebirdshop.com/$filename 2>&1 | head -3
done

echo ""
echo "=== Summary ==="
echo "If all .jpg files fail via domain but work on localhost,"
echo "this suggests Next.js has an issue serving .jpg files through the proxy."
echo ""
echo "If only logo.jpg fails, it's logo-specific."

