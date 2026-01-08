FROM docker.io/node:20-alpine AS builder

WORKDIR /app

# 複製 package 文件
COPY package*.json ./

# 安裝依賴並清理緩存
RUN npm install && npm cache clean --force

# 複製源代碼
COPY . .

# 構建應用 - 使用環境變量優化構建
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV VITE_OPTIMIZE_DEPS_FORCE=true
RUN npm run build

# 生產階段
FROM docker.io/nginx:alpine

# 複製構建產物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
