# Podman 部署指南

本指南說明如何使用 Podman 在伺服器上部署 Flowing Gold 智慧記帳應用。

## 前置需求

- Podman 已安裝
- Podman Compose 已安裝（或使用 `docker-compose` 相容模式）

## 安裝 Podman（如果尚未安裝）

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get -y install podman
```

### CentOS/RHEL

```bash
sudo yum -y install podman
```

### Fedora

```bash
sudo dnf -y install podman
```

## 安裝 Podman Compose

```bash
pip3 install podman-compose
```

或者使用 Podman 的 docker-compose 相容模式：

```bash
sudo ln -s /usr/bin/podman /usr/local/bin/docker-compose
```

## 部署步驟

### 1. 克隆專案

```bash
git clone https://github.com/Gerry1204/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. 構建並啟動容器

使用 Podman Compose：

```bash
podman-compose up -d --build
```

或使用 Podman 的 docker-compose 相容性：

```bash
podman compose up -d --build
```

### 3. 檢查容器狀態

```bash
podman ps
```

### 4. 查看日誌

```bash
# 查看後端日誌
podman logs expense-tracker-backend

# 查看前端日誌
podman logs expense-tracker-frontend

# 持續查看日誌
podman logs -f expense-tracker-backend
```

## 訪問應用

- **前端**: http://你的伺服器 IP:80
- **後端 API**: http://你的伺服器 IP:8000
- **API 文檔**: http://你的伺服器 IP:8000/docs

## 管理命令

### 停止容器

```bash
podman-compose down
```

### 重啟容器

```bash
podman-compose restart
```

### 更新應用

```bash
git pull
podman-compose up -d --build
```

### 刪除所有資料並重新開始

```bash
podman-compose down -v
rm -rf backend/data/*
podman-compose up -d --build
```

## 手動使用 Podman（不使用 Compose）

### 創建網路

```bash
podman network create expense-tracker-network
```

### 構建映像

```bash
# 構建後端
podman build -t expense-tracker-backend ./backend

# 構建前端
podman build -t expense-tracker-frontend ./frontend
```

### 運行容器

```bash
# 運行後端
podman run -d \
  --name expense-tracker-backend \
  --network expense-tracker-network \
  -p 8000:8000 \
  -v $(pwd)/backend/data:/app/data:Z \
  expense-tracker-backend

# 運行前端
podman run -d \
  --name expense-tracker-frontend \
  --network expense-tracker-network \
  -p 80:80 \
  expense-tracker-frontend
```

## 使用 Systemd 自動啟動（推薦用於生產環境）

### 1. 生成 systemd 服務文件

```bash
podman generate systemd --new --files --name expense-tracker-backend
podman generate systemd --new --files --name expense-tracker-frontend
```

### 2. 移動服務文件

```bash
sudo mv container-*.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### 3. 啟用並啟動服務

```bash
sudo systemctl enable container-expense-tracker-backend.service
sudo systemctl enable container-expense-tracker-frontend.service
sudo systemctl start container-expense-tracker-backend.service
sudo systemctl start container-expense-tracker-frontend.service
```

### 4. 檢查狀態

```bash
sudo systemctl status container-expense-tracker-backend.service
sudo systemctl status container-expense-tracker-frontend.service
```

## 備份與恢復

### 備份用戶數據

```bash
tar -czf backup-$(date +%Y%m%d).tar.gz backend/data/
```

### 恢復數據

```bash
tar -xzf backup-YYYYMMDD.tar.gz
```

## 故障排除

### 檢查容器日誌

```bash
podman logs expense-tracker-backend
podman logs expense-tracker-frontend
```

### 進入容器檢查

```bash
podman exec -it expense-tracker-backend /bin/bash
podman exec -it expense-tracker-frontend /bin/sh
```

### 重新構建

```bash
podman-compose down
podman-compose build --no-cache
podman-compose up -d
```

## 安全建議

1. **使用反向代理**：建議在生產環境使用 Nginx 或 Traefik 作為反向代理
2. **HTTPS**：配置 SSL/TLS 證書（推薦使用 Let's Encrypt）
3. **防火牆**：只開放必要的端口
4. **定期更新**：保持系統和容器映像更新
5. **數據備份**：定期備份 `backend/data` 目錄

## 性能優化

- 考慮使用 Redis 作為緩存層
- 啟用 nginx gzip 壓縮（已在配置中啟用）
- 使用 CDN 加速靜態資源
- 定期清理舊的容器映像和卷

## 監控

可以使用以下工具監控容器：

- Podman stats: `podman stats`
- Prometheus + Grafana
- cAdvisor
