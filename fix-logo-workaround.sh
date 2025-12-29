#!/bin/bash
# Workaround: Copy logo to a different name that definitely works

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== Workaround: Use logo-image.jpg instead ==="

if [ -f "public/logo.jpg" ]; then
    # Copy to a name that definitely works
    cp public/logo.jpg public/logo-image.jpg
    echo "✅ Created public/logo-image.jpg"
    
    # Test if it works
    echo ""
    echo "Testing logo-image.jpg:"
    curl -I http://localhost:3000/logo-image.jpg 2>&1 | head -3
    curl -I https://swebirdshop.com/logo-image.jpg 2>&1 | head -3
    
    echo ""
    if curl -I https://swebirdshop.com/logo-image.jpg 2>&1 | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
        echo "✅ logo-image.jpg works! You can update your code to use /logo-image.jpg"
        echo ""
        echo "Files to update:"
        echo "  - components/header.tsx: Change src=\"/logo.jpg\" to src=\"/logo-image.jpg\""
        echo "  - app/layout.tsx: Change icon URLs to /logo-image.jpg"
    else
        echo "⚠️  logo-image.jpg also doesn't work. This is a deeper Next.js issue."
    fi
else
    echo "❌ logo.jpg not found in public/"
fi

