# 專案需求規格書：LocalFlow Expense Tracker (本地私有雲記帳分析 App)

## 1. 專案概覽 (Project Overview)
**專案名稱**：LocalFlow Expense Tracker (暫定)
**專案目標**：開發一個資料完全存儲在本地電腦，但能透過手機瀏覽器（PWA）進行記帳與查看的系統。
**核心價值**：
*   **隱私安全性**：資料不雲端，完全掌控。
*   **便利性**：手機隨手記帳，電腦深度分析。
*   **分析力**：利用 Python 進行靈活的數據分析。

## 2. 技術架構 (Tech Stack)
*   **前端 (Frontend)**：Next.js (React) + TypeScript
    *   **UI 框架**：Tailwind CSS + Shadcn/UI (追求精緻、現代化的設計，支援深色模式)。
    *   **圖表庫**：Recharts (用於豐富的視覺化分析)。
*   **後端 (Backend)**：Python FastAPI
*   **資料庫 (Database)**：SQLite (單一檔案，易於備份與遷移)。
*   **運行環境**：本地電腦作為 Server，手機透過區域網路 (Wi-Fi) 連線。

## 3. 功能需求 (Functional Requirements)

### 3.1 手機端 (Mobile View) - 重點在「快速輸入」
*   **首頁儀表板**：
    *   顯示本月總支出、總收入、結餘。
    *   顯示今日支出總額。
    *   簡單的「本週支出趨勢」迷你圖。
*   **快速記帳 (核心功能)**：
    *   大按鈕設計，單手可操作。
    *   欄位：日期 (預設今天)、金額 (大字體)、類別 (圖示選擇)、備註、收支類型。
    *   計算機功能：輸入金額時支援簡單加減運算 (如 100+50)。
*   **近期紀錄**：
    *   條列式顯示最近 10 筆交易，可點擊編輯或刪除。

### 3.2 電腦端 (Desktop View) - 重點在「深度分析」
*   **全功能管理表格**：
    *   類似 Excel 的介面，可批量選取、編輯、刪除。
    *   支援依日期、金額、類別篩選與排序。
*   **高階分析報表**：
    *   圓餅圖：各類別支出佔比。
    *   長條圖/折線圖：每月/每週支出趨勢比較。
    *   同環比分析：與上個月或去年同期比較（例如：「餐費比上月增加 15%」）。
*   **匯入/匯出**：
    *   支援 CSV 匯入 (從銀行下載的明細)。
    *   資料庫備份按鈕 (下載 .db 檔)。

## 4. 資料庫結構範例 (Schema)

**Table: Transactions**

| 欄位名稱 | 類型 | 說明 |
| :--- | :--- | :--- |
| id | Integer (PK) | 自動遞增 ID |
| date | Date | 交易日期 (YYYY-MM-DD) |
| amount | Float | 金額 |
| type | String | "expense" (支出) 或 "income" (收入) |
| category | String | 例如：飲食、交通、娛樂... |
| note | String | 備註 (選填) |
| created_at | DateTime | 建立時間 |

## 5. 介面設計風格 (UI/UX)
*   **色調**：
    *   支出：使用柔和的紅色或暖色系 (Coral/Tomato)。
    *   收入：使用清新的綠色或藍綠色 (Teal/Emerald)。
*   **背景**：支援深色模式 (Dark Mode)，帶有玻璃擬態 (Glassmorphism) 的半透明卡片效果。
*   **互動**：
    *   手機端支援 PWA (可加入主畫面)。
    *   表單送出後要有細微的震動回饋 (Haptic Feedback) 或成功動畫。