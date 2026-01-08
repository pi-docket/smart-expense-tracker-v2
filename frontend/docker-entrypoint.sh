#!/bin/sh

# 等待 backend 可解析
echo "Waiting for backend DNS..."
max_retries=30
retry=0

while [ $retry -lt $max_retries ]; do
    if getent hosts backend > /dev/null 2>&1; then
        echo "Backend DNS resolved!"
        break
    fi
    retry=$((retry + 1))
    echo "Retry $retry/$max_retries - waiting for DNS..."
    sleep 1
done

if [ $retry -eq $max_retries ]; then
    echo "Warning: Could not resolve backend, using IP fallback"
fi

# 啟動 nginx
exec nginx -g "daemon off;"
