import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { 
  Plus, Trash2, ArrowUpCircle, ArrowDownCircle, 
  LayoutDashboard, List, Wallet, Calculator,
  ChevronLeft, ChevronRight, Moon, Sun, Download, Calendar, X,
  TrendingUp, Activity, Tag
} from 'lucide-react';
import { Transaction, TransactionCreate, TransactionType, DashboardStats, YearlyStats } from './types';

// --- Mock Data Service (Fallback if backend isn't running) ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, date: new Date().toISOString().split('T')[0], amount: 150, type: 'expense', category: 'Food', note: 'Lunch' },
  { id: 2, date: new Date().toISOString().split('T')[0], amount: 5000, type: 'income', category: 'Salary', note: 'Freelance' },
  { id: 3, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], amount: 1200, type: 'expense', category: 'Transport', note: 'Gas' },
  { id: 4, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], amount: 300, type: 'expense', category: 'Entertainment', note: 'Movie' },
];

// --- Constants ---
const API_URL = ''; // Use relative path for proxy
const EXPENSE_COLOR = '#e11d48';
const INCOME_COLOR = '#059669';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#e11d48', '#8884d8'];
const INITIAL_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Salary', 'Bills', 'Housing', 'Education', 'Shopping', 'Health', 'Other'];

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-none",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }> = ({ children, className = '', ...props }) => (
  <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-4 ${className}`} {...props}>
    {children}
  </div>
);

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Date Filter State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to first day of month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Derived Data (Filtered)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<TransactionType>('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [trendCategory, setTrendCategory] = useState('All');
  const [recentPage, setRecentPage] = useState(1);
  const [deleteTxId, setDeleteTxId] = useState<number | null>(null);
  const timerRef = React.useRef<any>(null); // Use any to avoid NodeJS.Timeout type issues
  const ITEMS_PER_PAGE = 5;

  // Load Theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch Data
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions/`);
      if (!res.ok) throw new Error('Failed to connect to backend');
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.warn("Backend not reachable, using mock data for demo.");
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyStats = async (year: string) => {
      try {
          const res = await fetch(`${API_URL}/stats/year/${year}`);
          if (res.ok) {
              const data = await res.json();
              setYearlyStats(data);
          }
      } catch (error) {
          console.error("Failed to fetch yearly stats", error);
      }
  };

  useEffect(() => {
    fetchTransactions();
    // Default to current year or extracted year from startDate if applicable
    fetchYearlyStats(new Date().getFullYear().toString());
  }, []);

  // Stats Calculation
  const stats: DashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount;
      else {
        acc.totalExpense += t.amount;
        if (t.date === today) acc.todayExpense += t.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0, todayExpense: 0 });
  }, [filteredTransactions]);

  // Chart Data Preparation
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const weeklyData = useMemo(() => {
    const data: Record<string, { date: string; amount: number }> = {};
    
    // Initialize dates in range to avoid gaps
    const dates = [];
    const currDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currDate <= lastDate) {
        dates.push(currDate.toISOString().split('T')[0]);
        currDate.setDate(currDate.getDate() + 1);
    }
    dates.forEach(d => { data[d] = { date: d, amount: 0 }; });

    filteredTransactions.forEach(t => {
       if (t.type === 'expense' && (trendCategory === 'All' || t.category === trendCategory)) {
           if (data[t.date]) {
               data[t.date].amount += t.amount;
           }
       }
    });
    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions, trendCategory, startDate, endDate]);


  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple calculator logic for amount
    let finalAmount = 0;
    try {
        // eslint-disable-next-line no-eval
        finalAmount = eval(amountInput); 
    } catch {
        finalAmount = parseFloat(amountInput);
    }

    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!category.trim()) {
        alert("Please select or enter a category");
        return;
    }

    // Add custom category to list if it's new
    if (isCustomCategory && !categories.includes(category)) {
        setCategories(prev => [...prev, category]);
    }

    const newTx: TransactionCreate = {
      date,
      amount: finalAmount,
      type,
      category,
      note
    };

    try {
      const res = await fetch(`${API_URL}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (res.ok) {
        await fetchTransactions();
        setShowAddModal(false);
        setAmountInput('');
        setNote('');
        if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
      }
    } catch (err) {
      console.error("Error adding transaction", err);
      // Fallback for demo
      const mockId = Math.max(...transactions.map(t => t.id), 0) + 1;
      setTransactions([...transactions, { ...newTx, id: mockId }]);
      setShowAddModal(false);
    }
  };

  const performDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchTransactions();
    } catch (err) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("Delete this transaction?")) {
        await performDelete(id);
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Date,Type,Category,Amount,Note\n"
        + transactions.map(t => `${t.id},${t.date},${t.type},${t.category},${t.amount},${t.note || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "localflow_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Long Press Handlers
  const handleTouchStart = (id: number) => {
      timerRef.current = setTimeout(() => {
          setDeleteTxId(id);
          if (navigator.vibrate) navigator.vibrate(50);
      }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
      if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
      }
  };

  const confirmMobileDelete = async () => {
      if (deleteTxId !== null) {
          await performDelete(deleteTxId);
          setDeleteTxId(null);
      }
  };

  // --- Views ---

  const dashboardView = (
    <div className="space-y-6 pb-20">
      {/* Date Filter */}
      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between p-3">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar size={20} />
              <span className="font-medium">Date Range</span>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
              <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm w-full md:w-auto outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center text-gray-400">-</span>
              <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white text-sm w-full md:w-auto outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
      </Card>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white dark:from-slate-700 dark:to-slate-800">
            <p className="text-slate-400 text-sm font-medium">Total Balance</p>
            <h2 className="text-3xl font-bold mt-1">${stats.balance.toFixed(2)}</h2>
        </Card>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <Card className="border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                        <ArrowUpCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Income</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">${stats.totalIncome.toFixed(0)}</p>
                    </div>
                </div>
            </Card>
            <Card className="border-l-4 border-l-rose-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400">
                        <ArrowDownCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Expense</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">${stats.totalExpense.toFixed(0)}</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Today's Insight */}
      <Card className="flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Spent Today</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${stats.todayExpense.toFixed(2)}</p>
        </div>
        <div className="text-right">
             <Button variant="ghost" onClick={exportData} title="Export CSV">
                <Download size={20} />
             </Button>
        </div>
      </Card>

      {/* Yearly Overview Section */}
      {yearlyStats && (
        <div className="space-y-4">
             <h3 className="font-semibold text-gray-700 dark:text-gray-200">Yearly Overview</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-800">
                     <div className="flex items-start justify-between">
                         <div>
                             <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Highest Daily Spend</p>
                             <div className="mt-2">
                                 {yearlyStats.highest_spending_day ? (
                                     <>
                                         <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{yearlyStats.highest_spending_day.date}</p>
                                         <p className="text-rose-600 dark:text-rose-400 font-semibold">${yearlyStats.highest_spending_day.amount.toFixed(2)}</p>
                                     </>
                                 ) : (
                                     <p className="text-sm text-gray-500">No data</p>
                                 )}
                             </div>
                         </div>
                         <div className="p-2 bg-white/50 dark:bg-rose-900/30 rounded-lg text-rose-600">
                             <TrendingUp size={20} />
                         </div>
                     </div>
                 </Card>

                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                     <div className="flex items-start justify-between">
                         <div>
                             <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Most Transactions Day</p>
                             <div className="mt-2">
                                 {yearlyStats.most_frequent_day ? (
                                     <>
                                         <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{yearlyStats.most_frequent_day.date}</p>
                                         <p className="text-blue-600 dark:text-blue-400 font-semibold">{yearlyStats.most_frequent_day.count} items</p>
                                     </>
                                 ) : (
                                      <p className="text-sm text-gray-500">No data</p>
                                 )}
                             </div>
                         </div>
                         <div className="p-2 bg-white/50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                             <Activity size={20} />
                         </div>
                     </div>
                 </Card>

                 <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                     <div className="flex items-start justify-between">
                         <div>
                             <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Top Category</p>
                             <div className="mt-2">
                                 {yearlyStats.highest_category ? (
                                     <>
                                         <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{yearlyStats.highest_category.category}</p>
                                         <p className="text-purple-600 dark:text-purple-400 font-semibold">${yearlyStats.highest_category.amount.toFixed(2)}</p>
                                     </>
                                 ) : (
                                     <p className="text-sm text-gray-500">No data</p>
                                 )}
                             </div>
                         </div>
                         <div className="p-2 bg-white/50 dark:bg-purple-900/30 rounded-lg text-purple-600">
                             <Tag size={20} />
                         </div>
                     </div>
                 </Card>
             </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:pb-0">
        <Card className="h-80 flex flex-col min-w-full lg:min-w-0 snap-center">
            <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Expenses by Category</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ bottom: 20 }}>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
        <Card className="h-80 flex flex-col min-w-full lg:min-w-0 snap-center">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Consumption Trend</h3>
                <select 
                    value={trendCategory}
                    onChange={(e) => setTrendCategory(e.target.value)}
                    className="text-sm border-none bg-gray-100 dark:bg-slate-700 rounded-lg px-2 py-1 outline-none text-gray-700 dark:text-gray-200"
                >
                    <option value="All">All Expenses</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="flex-1 min-h-0 bg-gradient-to-t from-white/0 to-white/0 rounded-xl overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ bottom: 10, left: -20, right: 10 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} />
                        <YAxis tick={{fontSize: 10}} />
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke={EXPENSE_COLOR} 
                            fillOpacity={1} 
                            fill="url(#colorAmount)" 
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </div>

      {/* Recent Transactions (Mobile Friendly) */}
      <div className="md:hidden">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300 ml-1">Recent Activity</h3>
          <div className="space-y-3">
              {filteredTransactions.slice((recentPage - 1) * ITEMS_PER_PAGE, recentPage * ITEMS_PER_PAGE).map(t => (
                  <Card 
                    key={t.id} 
                    className="flex justify-between items-center py-3 active:scale-[0.98] transition-transform select-none"
                    // @ts-ignore
                    onTouchStart={() => handleTouchStart(t.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={() => handleTouchStart(t.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                  >
                      <div className="flex gap-3 items-center pointer-events-none">
                          <div className={`w-2 h-10 rounded-full ${t.type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                          <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{t.category}</p>
                              <p className="text-xs text-gray-500">{t.note || t.date}</p>
                          </div>
                      </div>
                      <span className={`font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'} pointer-events-none`}>
                          {t.type === 'expense' ? '-' : '+'}${t.amount}
                      </span>
                  </Card>
              ))}
          </div>
          {/* Pagination Controls */}
          {filteredTransactions.length > ITEMS_PER_PAGE && (
              <div className="flex justify-between items-center mt-4 px-2">
                  <Button 
                      variant="ghost" 
                      onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                      disabled={recentPage === 1}
                      className={recentPage === 1 ? 'opacity-50' : ''}
                  >
                      <ChevronLeft size={20} /> Prev
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                      Page {recentPage} of {Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)}
                  </span>
                  <Button 
                      variant="ghost" 
                      onClick={() => setRecentPage(p => Math.min(Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE), p + 1))}
                      disabled={recentPage === Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)}
                      className={recentPage === Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) ? 'opacity-50' : ''}
                  >
                      Next <ChevronRight size={20} />
                  </Button>
              </div>
          )}
          </div>
      </div>
  );

  const transactionsView = (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Transactions</h2>
        <Button onClick={exportData} variant="secondary">
            <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm border-b dark:border-slate-600">
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Note</th>
                        <th className="p-4 font-semibold text-right">Amount</th>
                        <th className="p-4 font-semibold text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{t.date}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    t.type === 'expense' 
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                    {t.category}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{t.note}</td>
                            <td className={`p-4 text-right font-mono font-medium ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {t.type === 'expense' ? '-' : '+'}{t.amount.toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => performDelete(t.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Wallet className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg text-gray-800 dark:text-white tracking-tight">LocalFlow</h1>
        </div>
        <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
      </header>

      {/* Desktop Navigation (Moved to top of main content) */}
      <div className="hidden md:flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 p-1 rounded-full inline-flex">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'}`}
            >
                <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'}`}
            >
                <List size={18} /> Transactions
            </button>
            <button 
                onClick={() => setShowAddModal(true)}
                className="ml-2 pl-4 pr-6 py-2 border-l border-gray-200 dark:border-slate-600 text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2"
            >
                <Plus size={18} /> Add
            </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-6">
        {activeTab === 'dashboard' ? dashboardView : transactionsView}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button 
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-400/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
            <Plus size={32} />
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
                    <h3 className="font-bold text-lg dark:text-white">New Transaction</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button 
                            type="button" 
                            onClick={() => setType('expense')}
                            className={`py-2 rounded-lg font-medium text-sm transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-600 shadow text-rose-600' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Expense
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setType('income')}
                            className={`py-2 rounded-lg font-medium text-sm transition-all ${type === 'income' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Amount Input with Calculator Icon */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                            <input 
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                                className="w-full pl-8 pr-10 py-3 text-2xl font-bold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                autoFocus
                            />
                            <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Supports math (e.g., 50+20)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Date</label>
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Category</label>
                            {isCustomCategory ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="Enter category name..."
                                        className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <Button 
                                        type="button"
                                        variant="secondary"
                                        className="px-3"
                                        title="Cancel custom category"
                                        onClick={() => {
                                            setIsCustomCategory(false);
                                            setCategory(categories[0]);
                                        }}
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            ) : (
                                <select 
                                    value={category} 
                                    onChange={(e) => {
                                        if (e.target.value === '___custom___') {
                                            setIsCustomCategory(true);
                                            setCategory('');
                                        } else {
                                            setCategory(e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="___custom___" className="font-bold text-blue-600">+ New Category...</option>
                                </select>
                            )}
                        </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Note (Optional)</label>
                         <input 
                            type="text" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Lunch with friends..."
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                         />
                    </div>

                    <Button type="submit" className="w-full py-3 text-lg">
                        Save Transaction
                    </Button>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Mobile) */}
      {deleteTxId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <h3 className="font-bold text-lg dark:text-white mb-2">Delete Transaction?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to remove this transaction? This action cannot be undone.</p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setDeleteTxId(null)} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmMobileDelete} className="flex-1">
                        Delete
                    </Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}