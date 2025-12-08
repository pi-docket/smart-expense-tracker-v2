# LocalFlow - Personal Expense Tracker

LocalFlow is a beautiful, modern, and responsive personal expense tracker application that works fully locally. It features a React frontend and a Python FastAPI backend with SQLite database.

## Features

- **Dashboard**: Visual overview of your finances with Pie Charts and Bar Charts.
- **Date Range Filtering**: Analyze your spending behaviors for specific time periods.
- **Transaction Management**: Add, view, and delete income and expense records.
- **Responsive Design**: Works perfectly on Desktop, Tablet, and Mobile devices.
- **Dark Mode**: Built-in dark mode support.
- **Local Database**: All data is stored locally in `expenses.db` (SQLite).
- **Calculator**: Built-in calculator input for amounts.
- **CSV Export**: Export your transaction data to CSV anytime.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.8+

### Installation

1.  **Clone or Download the project**
2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```
3.  **Install Backend Dependencies**
    ```bash
    pip install -r backend/requirements.txt
    ```

### Running the App

1.  **Start the Backend Server** (in one terminal)
    ```bash
    # Run from the root directory or inside backend/ directory
    # If in root:
    python -m uvicorn backend.main:app --reload

    # If inside backend/ directory:
    # uvicorn main:app --reload
    ```
    The backend will run at `http://127.0.0.1:8000`.

2.  **Start the Frontend Dev Server** (in another terminal)
    ```bash
    npm run dev
    ```
    Open the link shown (usually `http://localhost:5173`) in your browser.

## Usage Tips

- **Add Transaction**: Click the "+ Add" button (on desktop top right, or mobile floating button manually enabled if checking old versions, but currently unified in UI).
- **Date Filter**: Use the date pickers at the top of the dashboard to filter statistics.
- **Mobile Swipe**: On mobile, swipe left/right to switch between the Pie Chart and Weekly Trend charts.

## License

MIT
