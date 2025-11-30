import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserCircle2, Settings, Save, RefreshCw } from 'lucide-react';
import { getGASCodeTemplate, getConfig, saveConfig } from '../services/storageService';

interface LoginFormProps {
  onLogin: (user: User) => void;
  validUsers: User[];
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, validUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [configUrl, setConfigUrl] = useState('');

  useEffect(() => {
    const currentConfig = getConfig();
    setConfigUrl(currentConfig.gasWebAppUrl);
  }, []);

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

  const handleSaveConfig = () => {
      if (!configUrl.trim()) {
          alert("Vui lòng nhập URL!");
          return;
      }
      saveConfig({
          gasWebAppUrl: configUrl.trim(),
          useCloud: true
      });
      alert("Đã lưu cấu hình. Ứng dụng sẽ tải lại để kết nối...");
      window.location.reload();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getGASCodeTemplate());
    alert('Đã copy code Google Apps Script!');
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
        
        {/* Footer Config Links */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <button 
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-emerald-600 w-full transition-colors"
            >
                <Settings size={16} />
                {showConfig ? 'Ẩn Cấu hình Kết nối' : 'Cấu hình Kết nối Server'}
            </button>

            {showConfig && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">URL Web App (Google Apps Script)</label>
                    <input 
                        type="text" 
                        value={configUrl}
                        onChange={(e) => setConfigUrl(e.target.value)}
                        className="w-full text-sm border-slate-300 rounded p-2 mb-3 font-mono text-slate-600"
                        placeholder="https://script.google.com/..."
                    />
                    <div className="flex gap-2">
                         <button 
                            onClick={handleSaveConfig}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} />
                            Lưu & Kết nối lại
                        </button>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-slate-400 hover:text-emerald-600 underline w-full text-center block"
            >
                {showCode ? 'Ẩn mã nguồn' : 'Hiện mã nguồn Backend'}
            </button>

            {showCode && (
                <div className="mt-2 p-3 bg-slate-800 rounded text-xs text-slate-300 relative">
                    <p className="mb-2 font-medium text-white">Bước 1: Copy mã này vào file Code.gs trên Google Apps Script</p>
                    <p className="mb-2 font-medium text-white">Bước 2: Deploy &gt; New Deployment &gt; Web App &gt; Anyone</p>
                    <p className="mb-3 font-medium text-white">Bước 3: Copy URL dán vào phần "Cấu hình Kết nối Server" ở trên.</p>
                    
                    <button onClick={copyCode} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded mb-2 font-bold flex items-center justify-center gap-2 transition-colors">
                        <Save size={14} />
                        Copy Code
                    </button>
                    <p className="italic text-slate-500 text-center">User mặc định: admin / 123</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;