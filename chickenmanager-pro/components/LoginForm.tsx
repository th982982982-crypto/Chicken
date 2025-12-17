import React, { useState } from 'react';
import { User } from '../types';
import { UserCircle2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  validUsers: User[];
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, validUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find user in the validUsers list downloaded from Google Sheet
    // Fallback: If validUsers is empty (api error), allow admin/123 default
    let effectiveUsers = validUsers;
    if (effectiveUsers.length === 0) {
        effectiveUsers = [{ username: 'admin', password: '123', role: 'admin' }];
    }

    const foundUser = effectiveUsers.find(u => u.username === username && String(u.password) === password);

    if (foundUser) {
        onLogin(foundUser);
    } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <UserCircle2 size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">ChickenManager Pro</h1>
            <p className="text-slate-500 mt-2">Đăng nhập hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
                    placeholder="Nhập tên của bạn"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
                    placeholder="Nhập mật khẩu"
                />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl"
            >
                Đăng nhập
            </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400">
                Hệ thống tự động ghi nhớ phiên đăng nhập.
             </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;