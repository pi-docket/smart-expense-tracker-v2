@echo off
cd /d "%~dp0"
echo Starting LocalFlow Expense Tracker...

:: 1. Start Backend (Python/Uvicorn)
:: 確保進入 backend 資料夾成功才執行
if exist backend (
    start "LocalFlow Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0"
) else (
    echo Error: 'backend' folder not found!
    pause
    exit
)

:: Wait for backend
timeout /t 3 /nobreak >nul

:: 2. Start Frontend (Node.js)
:: 這裡假設你也需要讓前端監聽外部 IP (視你的框架而定，這裡以 Vite 為例)
start "LocalFlow Frontend" cmd /k "npm run dev -- --host"

:: 3. Open Browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ==========================================
echo Local Access:  http://localhost:3000
echo Mobile Access: http://localhost:3000
echo ==========================================
echo.
echo Done! Keep the windows open to keep the server running.