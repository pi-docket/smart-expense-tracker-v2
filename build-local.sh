#!/bin/bash

echo "本地構建前端..."
cd frontend

# 安裝依賴並構建
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "前端構建成功！"
    echo "現在可以使用 Dockerfile.prebuilt 部署到伺服器"
    echo ""
    echo "步驟："
    echo "1. 將整個專案上傳到伺服器"
    echo "2. 在 docker-compose.yml 中修改 frontend dockerfile 為 Dockerfile.prebuilt"
    echo "3. 執行 podman-compose up -d"
else
    echo "構建失敗"
    exit 1
fi
