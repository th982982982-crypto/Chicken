import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig, getGASCodeTemplate } from '../services/storageService';
import { AppConfig } from '../types';
import { Save, Copy, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({ gasWebAppUrl: '', useCloud: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleSave = () => {
    saveConfig(config);
    alert('Đã lưu cấu hình!');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getGASCodeTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cấu hình Backend</h2>
        <p className="text-slate-500">Kết nối ứng dụng với Google Sheets thông qua Google Apps Script.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-4 text-emerald-700">Bước 1: Triển khai Google Apps Script</h3>
        <p className="text-sm text-slate-600 mb-4">
            Tạo một Google Sheet mới, vào <strong>Extensions &gt; Apps Script</strong>, và dán đoạn mã sau vào:
        </p>
        
        <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto mb-4">
            <button 
                onClick={copyCode}
                className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
                title="Copy code"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <pre className="whitespace-pre-wrap">{getGASCodeTemplate()}</pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-4 text-emerald-700">Bước 2: Kết nối URL</h3>
        <p className="text-sm text-slate-600 mb-4">
            Sau khi Deploy Web App, hãy dán URL vào bên dưới. (Lưu ý: Chức năng này cần backend thực tế để hoạt động hoàn chỉnh).
        </p>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Web App URL</label>
                <input 
                    type="text" 
                    value={config.gasWebAppUrl}
                    onChange={(e) => setConfig({...config, gasWebAppUrl: e.target.value})}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full border-slate-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
                />
            </div>
            
             <div className="flex items-center gap-2">
                <input 
                    type="checkbox"
                    id="useCloud"
                    checked={config.useCloud}
                    onChange={(e) => setConfig({...config, useCloud: e.target.checked})}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="useCloud" className="text-sm text-slate-700 select-none">
                    Kích hoạt chế độ Cloud (Chỉ hoạt động khi URL đúng)
                </label>
            </div>

            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
                <Save size={18} />
                Lưu cấu hình
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
