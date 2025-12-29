#!/bin/bash
# Fix PM2 and logo serving issue

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== 1. Check PM2 status ==="
pm2 status

echo ""
echo "=== 2. Check PM2 logs for errors ==="
pm2 logs swebirdshop --lines 10 --nostream

echo ""
echo "=== 3. Check PM2 working directory ==="
pm2 describe swebirdshop | grep -E "cwd|exec cwd|script path"

echo ""
echo "=== 4. Stop and restart PM2 properly ==="
pm2 stop swebirdshop
sleep 2
pm2 start swebirdshop
sleep 5

echo ""
echo "=== 5. Verify PM2 is running ==="
pm2 status

echo ""
echo "=== 6. Test Next.js on localhost ==="
curl -I http://localhost:3000/ 2>&1 | head -5

echo ""
echo "=== 7. Test logo on localhost ==="
curl -I http://localhost:3000/logo.jpg 2>&1 | head -5

echo ""
echo "=== 8. Test logo via domain ==="
curl -I https://swebirdshop.com/logo.jpg 2>&1 | head -5

echo ""
echo "=== 9. Check if Next.js process can see the file ==="
# Get the PM2 process PID and check from its perspective
PM2_PID=$(pm2 jlist | grep -A 5 '"name":"swebirdshop"' | grep '"pid"' | head -1 | cut -d: -f2 | tr -d ' ,"')
if [ ! -z "$PM2_PID" ]; then
    echo "PM2 Process PID: $PM2_PID"
    # Check the working directory of the process
    PWD=$(readlink -f /proc/$PM2_PID/cwd 2>/dev/null || echo "Cannot read process cwd")
    echo "Process working directory: $PWD"
fi

