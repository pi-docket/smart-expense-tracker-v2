# Flowing Gold (流金) 💰

**Flowing Gold** is a beautiful, modern, and privacy-focused personal expense tracker application. It empowers you to manage your finances locally with a stunning React frontend and a robust Python FastAPI backend.

![Project Banner](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000)
*(Replace with actual screenshot)*

## ✨ Key Features

*   **🌍 Multi-language Support**: Fully localized in **English**, **Traditional Chinese (繁體中文)**, **Japanese (日本語)**, and **Korean (한국어)**.
*   **📊 Interactive Dashboard**: Visualize your finances with dynamic **Pie Charts** (Expenses by Category) and **Area Charts** (Consumption Trend).
*   **📱 Responsive & Mobile-First**: A seamless experience across Desktop, Tablet, and Mobile devices. Includes touch-friendly interactions like swiping for charts.
*   **🌗 Dark Mode**: Built-in toggle for Light and Dark themes to suit your preference.
*   **📅 Advanced Filtering**: Analyze spending by custom date ranges or quick presets (Last Month, 3 Months, etc.).
*   **📝 Transaction Management**:
    *   Easily add income and expenses with a built-in calculator (e.g., input `50+20`).
    *   Paginated transaction list with custom rows per page (10, 20, 30, 50).
    *   Delete records with safety confirmation.
*   **📈 Yearly Statistics**: Deep insights into your highest spending days, most frequent transaction days, and top categories of the year.
*   **🔒 Local & Private**: Your data stays on your machine, stored in a local SQLite database (`expenses.db`).
*   **📂 CSV Export**: Export your data anytime for external analysis.

## 🛠️ Tech Stack

*   **Frontend**:
    *   [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
    *   [Vite](https://vitejs.dev/) - Blazing fast build tool
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
    *   [Recharts](https://recharts.org/) - Data visualization
    *   [Lucide React](https://lucide.dev/) - Beautiful icons
*   **Backend**:
    *   [Python](https://www.python.org/) (3.8+)
    *   [FastAPI](https://fastapi.tiangolo.com/) - Modern, high-performance web framework
    *   [SQLAlchemy](https://www.sqlalchemy.org/) - SQL Toolkit and ORM
    *   [SQLite](https://www.sqlite.org/) - Lightweight disk-based database

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   Node.js & npm
*   Python 3.8+

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/flowing-gold.git
    cd flowing-gold
    ```

2.  **Backend Setup**
    Navigate to the project root and install Python dependencies:
    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Frontend Setup**
    Install Node.js dependencies:
    ```bash
    npm install
    ```

### Database Configuration (Optional)

By default, the application uses `test.db` (which may contain generated test data) or `expenses.db`. Before running the app, you can choose which database to use:

1.  Open `backend/database.py`.
2.  Modify the `SQLALCHEMY_DATABASE_URL` line:
    ```python
    # To use a clean/production database:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./expenses.db"

    # To use the test database with sample data:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
    ```

### ▶️ Running the Application

You need to run both the backend and frontend servers.

**1. Start the Backend Server**
Open a terminal and run:
```bash
# Windows
python -m uvicorn backend.main:app --reload

# Mac/Linux
python3 -m uvicorn backend.main:app --reload
```
*The backend API will be available at `http://127.0.0.1:8000`*

**2. Start the Frontend Application**
Open a second terminal and run:
```bash
npm run dev
```
*Open the link shown (typically `http://localhost:5173`) in your browser to start tracking!*

---

## 💡 Usage Tips

*   **Calculator Input**: When adding a transaction, you can type math expressions directly into the amount field (e.g., typing `120*2` will save `240`).
*   **Quick Category**: Select from default categories or type to create a temporary custom one (for current session view).
*   **Switch Language**: Click the Globe icon 🌐 in the header to switch between EN, ZH, JA, and KO.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by Flowing Gold Team
