import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import UserManagement from './components/UserManagement';
import { User, Transaction, TransactionType } from './types';
import { 
    getLocalTransactions, 
    saveLocalTransaction, 
    deleteLocalTransaction, 
    getLocalCategories,
    saveLocalCategory,
    api
} from './services/storageService';
import { Loader2, Cloud, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userList, setUserList] = useState<User[]>([]); // List of all users for login/management
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // State for Income/Expense Tab
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);

  // Load Users on Startup for Login
  useEffect(() => {
    const fetchSystemUsers = async () => {
        setIsLoading(true);
        try {
            const users = await api.fetchUsers();
            setUserList(users);
        } catch (e) {
            console.error("Failed to fetch users");
            setUserList([{ username: 'admin', password: '123', role: 'admin' }]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchSystemUsers();
  }, []);

  // Initial Data Load when User Logs In
  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsSyncing(true);
    try {
        // Load transactions and categories in parallel
        const [txData, catData, uData] = await Promise.all([
            api.fetchTransactions(),
            api.fetchCategories(),
            api.fetchUsers() // Refresh user list
        ]);
        setTransactions(txData);
        setCategories(catData);
        setUserList(uData);
    } catch (error) {
        console.error("Sync error:", error);
        alert('Lỗi kết nối Google Sheets. Đang dùng dữ liệu offline.');
        setTransactions(getLocalTransactions());
        setCategories(getLocalCategories());
    } finally {
        setIsSyncing(false);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    setTransactions([]);
  };

  // Helper to add category explicitly (for the + button)
  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName) return;
    
    // Check if duplicate locally first to avoid UI jitter
    if (categories.some(c => c.toLowerCase() === categoryName.toLowerCase())) {
        return;
    }

    // Optimistic UI update
    setCategories(prev => [...prev, categoryName]);
    
    // Persist to local just in case
    saveLocalCategory(categoryName);

    // Save to Cloud
    try {
         await api.addCategory(categoryName);
    } catch(err) {
        console.error("Failed to save category to cloud", err);
        alert("Có lỗi khi lưu danh mục lên Cloud, nhưng đã lưu tạm thời trên máy.");
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const tx: Transaction = {
        ...newTx,
        id: Date.now().toString(),
        timestamp: Date.now()
    };

    // Optimistic UI update
    const updatedLocal = [tx, ...transactions];
    setTransactions(updatedLocal);

    // Save to Cloud in background
    try {
        await api.addTransaction(tx);
    } catch (error) {
        console.error("Failed to save to cloud", error);
        alert("Không lưu được lên Cloud.");
        saveLocalTransaction(tx); // Fallback
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa không?')) return;

    // Optimistic UI update
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);

    try {
        await api.deleteTransaction(id);
    } catch (error) {
        console.error("Failed to delete from cloud", error);
        deleteLocalTransaction(id); // Fallback
    }
  };

  // User Management Handlers
  const handleAddUser = async (u: User) => {
      // Optimistic
      setUserList(prev => [...prev, u]);
      try {
          await api.addUser(u);
      } catch (err) {
          alert('Lỗi khi thêm user lên Cloud');
      }
  };

  const handleDeleteUser = async (username: string) => {
      setUserList(prev => prev.filter(u => u.username !== username));
      try {
          await api.deleteUser(username);
      } catch (err) {
          alert('Lỗi khi xóa user trên Cloud');
      }
  };

  if (isLoading && !user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 flex-col gap-4">
              <Loader2 size={40} className="animate-spin text-emerald-600" />
              <p className="text-slate-600">Đang tải dữ liệu hệ thống...</p>
          </div>
      );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} validUsers={userList} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentUser={user} 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-end mb-4">
            {isSyncing ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Đang đồng bộ...
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    <Cloud size={14} />
                    Connected to Google Sheets
                </div>
            )}
        </div>

        {currentView === 'dashboard' && <Dashboard transactions={transactions} />}
        
        {currentView === 'transactions' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Quản lý Thu / Chi</h2>
                </div>

                {/* Tabs for Separation */}
                <div className="flex gap-4 p-1 bg-slate-200 rounded-lg w-fit">
                    <button 
                        onClick={() => setActiveTab(TransactionType.EXPENSE)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all ${
                            activeTab === TransactionType.EXPENSE 
                            ? 'bg-rose-600 text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-300'
                        }`}
                    >
                        <ArrowDownCircle size={18} />
                        Chi Phí (Mua)
                    </button>
                    <button 
                        onClick={() => setActiveTab(TransactionType.INCOME)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all ${
                            activeTab === TransactionType.INCOME 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-300'
                        }`}
                    >
                        <ArrowUpCircle size={18} />
                        Doanh Thu (Bán)
                    </button>
                </div>

                {/* Content filtered by Tab */}
                <div>
                     <TransactionForm 
                        key={activeTab} // Force re-render when switching tabs to clear form
                        fixedType={activeTab}
                        onAdd={handleAddTransaction} 
                        onAddCategory={handleAddCategory}
                        availableCategories={categories} 
                    />
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">
                            {activeTab === TransactionType.INCOME ? 'Lịch sử Thu' : 'Lịch sử Chi'}
                        </h3>
                        <TransactionList 
                            transactions={transactions.filter(t => t.type === activeTab)} 
                            onDelete={handleDeleteTransaction} 
                        />
                    </div>
                </div>
            </div>
        )}

        {currentView === 'users' && user.role === 'admin' && (
            <UserManagement 
                users={userList} 
                onAddUser={handleAddUser} 
                onDeleteUser={handleDeleteUser}
                currentUser={user}
            />
        )}
      </main>
    </div>
  );
};

export default App;