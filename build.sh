#!/bin/bash

# 設置文件描述符限制
ulimit -n 65536

# 清理舊的構建緩存
podman-compose down 2>/dev/null || true

# 構建並啟動
echo "開始構建容器..."
podman-compose build --no-cache

if [ $? -eq 0 ]; then
    echo "構建成功！啟動容器..."
    podman-compose up -d
    
    echo "檢查容器狀態..."
    podman ps
    
    echo ""
    echo "部署完成！"
    echo "前端: http://127.0.0.1:8090"
    echo "後端: http://127.0.0.1:8091"
    echo "API文檔: http://127.0.0.1:8091/docs"
else
    echo "構建失敗，請檢查錯誤訊息"
    exit 1
fi
