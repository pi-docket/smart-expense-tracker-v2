# 本地預構建前端
Write-Host "正在構建前端..." -ForegroundColor Green

Set-Location frontend

# 檢查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "錯誤: 未安裝 Node.js" -ForegroundColor Red
    exit 1
}

# 安裝依賴
Write-Host "安裝依賴..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "依賴安裝失敗" -ForegroundColor Red
    exit 1
}

# 構建
Write-Host "開始構建..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "構建失敗" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host "`n✓ 前端構建成功！" -ForegroundColor Green
Write-Host "`n接下來的步驟：" -ForegroundColor Cyan
Write-Host "1. 將整個專案資料夾上傳到 Ubuntu 伺服器" -ForegroundColor White
Write-Host "   scp -r smart-expense-tracker-v1 user@server:/path/" -ForegroundColor Gray
Write-Host "`n2. 在伺服器上執行：" -ForegroundColor White
Write-Host "   cd smart-expense-tracker-v1" -ForegroundColor Gray
Write-Host "   podman-compose up -d" -ForegroundColor Gray
Write-Host "`n3. 檢查狀態：" -ForegroundColor White
Write-Host "   podman ps" -ForegroundColor Gray
