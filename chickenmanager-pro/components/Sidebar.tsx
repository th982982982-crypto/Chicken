import React from 'react';
import { LayoutDashboard, Receipt, LogOut, Users } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, setView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Thu / Chi', icon: Receipt },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'users', label: 'Quản lý User', icon: Users });
  }

  return (
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

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2 mb-4">
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
  );
};

export default Sidebar;