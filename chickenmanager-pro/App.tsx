import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import UserManagement from './components/UserManagement';
import HistoryViewer from './components/HistoryViewer';
import { User, Transaction, TransactionType } from './types';
import { 
    getLocalTransactions, 
    saveLocalTransaction, 
    deleteLocalTransaction, 
    getLocalCategories,
    saveLocalCategory,
    api,
    getUserSession,
    saveUserSession,
    clearUserSession
} from './services/storageService';
import { Loader2, Cloud, ArrowDownCircle, ArrowUpCircle, Menu } from 'lucide-react';

const App: React.FC = () => {
  // Initialize user from local storage session for auto-login
  const [user, setUser] = useState<User | null>(() => getUserSession());
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userList, setUserList] = useState<User[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    // Only fetch system users if needed or in background
    const fetchSystemUsers = async () => {
        // If we are already logged in, we might want to refresh user list silently
        if (!user) setIsLoading(true);
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
  }, [user]); // Re-run if user status changes, essentially helps on logout/login transitions

  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsSyncing(true);
    try {
        const [txData, catData, uData] = await Promise.all([
            api.fetchTransactions(),
            api.fetchCategories(),
            api.fetchUsers()
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
    saveUserSession(u); // Auto-save session
  };

  const handleLogout = () => {
    setUser(null);
    setTransactions([]);
    setIsMobileMenuOpen(false);
    clearUserSession(); // Clear session
  };

  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName) return;
    if (categories.some(c => c.toLowerCase() === categoryName.toLowerCase())) {
        return;
    }
    setCategories(prev => [...prev, categoryName]);
    saveLocalCategory(categoryName);
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
    const updatedLocal = [tx, ...transactions];
    setTransactions(updatedLocal);
    try {
        await api.addTransaction(tx);
    } catch (error) {
        console.error("Failed to save to cloud", error);
        alert("Không lưu được lên Cloud.");
        saveLocalTransaction(tx); 
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa không?')) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    try {
        await api.deleteTransaction(id);
    } catch (error) {
        console.error("Failed to delete from cloud", error);
        deleteLocalTransaction(id); 
    }
  };

  const handleAddUser = async (u: User) => {
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

  const handleCloseLedger = async (batchName: string) => {
      try {
          const result = await api.closeLedger(batchName);
          if (result.status === 'success') {
              alert(result.message || 'Kết sổ thành công! Dữ liệu đã được lưu trữ.');
              setTransactions([]);
              loadData();
          } else {
              alert('Lỗi: ' + result.message);
          }
      } catch (error) {
          console.error(error);
          alert('Lỗi kết nối khi kết sổ.');
      }
  };

  const handleSetView = (view: string) => {
      setCurrentView(view);
      setIsMobileMenuOpen(false); // Close menu on mobile when clicking items
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
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-2">
             <span className="text-xl font-bold">🐔 Gà Pro</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={24} />
          </button>
      </div>

      <Sidebar 
        currentUser={user} 
        currentView={currentView} 
        setView={handleSetView} 
        onLogout={handleLogout}
        onCloseLedger={handleCloseLedger}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <main className={`flex-1 p-4 md:p-8 transition-all ${isMobileMenuOpen ? 'opacity-50 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''} md:ml-64`}>
        <div className="flex justify-end mb-4">
            {isSyncing ? (
                <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Đang đồng bộ...
                </div>
            ) : (
                <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    <Cloud size={14} />
                    <span className="hidden md:inline">Connected to Google Sheets</span>
                    <span className="md:hidden">Online</span>
                </div>
            )}
        </div>

        {currentView === 'dashboard' && <Dashboard transactions={transactions} />}
        
        {currentView === 'transactions' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Quản lý Thu / Chi</h2>
                </div>

                {/* Tabs for Separation */}
                <div className="flex p-1 bg-slate-200 rounded-lg w-full md:w-fit overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab(TransactionType.EXPENSE)}
                        className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-md font-medium transition-all text-sm md:text-base whitespace-nowrap ${
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
                        className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-md font-medium transition-all text-sm md:text-base whitespace-nowrap ${
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
                        key={activeTab} 
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

        {currentView === 'history' && (
            <HistoryViewer />
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