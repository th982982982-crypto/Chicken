import React, { useState } from 'react';
import { LayoutDashboard, Receipt, LogOut, Users, Archive, Save, X } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
  onCloseLedger: (batchName: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, setView, onLogout, onCloseLedger }) => {
  const [showModal, setShowModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Thu / Chi', icon: Receipt },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'users', label: 'Quản lý User', icon: Users });
  }

  const handleCloseLedgerClick = async () => {
      if (!batchName.trim()) {
          alert("Vui lòng nhập tên đợt!");
          return;
      }
      if (!window.confirm("CẢNH BÁO: Hành động này sẽ di chuyển toàn bộ dữ liệu hiện tại sang sheet lưu trữ và làm trống giao diện để bắt đầu đợt mới. Bạn có chắc chắn không?")) {
          return;
      }

      setLoading(true);
      await onCloseLedger(batchName);
      setLoading(false);
      setShowModal(false);
      setBatchName('');
  };

  return (
    <>
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           🐔 Gà Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1">Quản lý trại gà</p>
      </div>

      <div className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === item.id 
                ? 'bg-emerald-600 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700 space-y-4">
        {currentUser.role === 'admin' && (
             <button 
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-all text-sm font-medium shadow-lg"
            >
                <Archive size={16} />
                Kết sổ
            </button>
        )}

        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
                {currentUser.username[0].toUpperCase()}
            </div>
            <div>
                <p className="text-sm font-medium">{currentUser.username}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white py-2 rounded-md transition-all text-sm"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </div>

    {/* Close Ledger Modal */}
    {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                        <Archive size={24} />
                        Kết sổ & Bắt đầu đợt mới
                    </h2>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-lg text-sm mb-4">
                    Tính năng này sẽ lưu trữ toàn bộ dữ liệu hiện tại vào một Sheet riêng trên Google Sheets và <strong>xóa trắng</strong> giao diện để bạn nhập liệu cho lứa gà mới.
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Đặt tên cho đợt cũ (để lưu trữ):
                    </label>
                    <input 
                        type="text" 
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        placeholder="VD: Lứa 1 - Tháng 5/2024"
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleCloseLedgerClick}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận Kết sổ'}
                        {!loading && <Save size={18} />}
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Sidebar;