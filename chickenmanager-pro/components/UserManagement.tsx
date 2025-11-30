import React, { useState } from 'react';
import { User } from '../types';
import { Trash2, UserPlus, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (u: User) => Promise<void>;
  onDeleteUser: (username: string) => Promise<void>;
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    // Simple validation
    if (users.some(u => u.username === username)) {
        alert('Tên đăng nhập đã tồn tại!');
        return;
    }

    setLoading(true);
    await onAddUser({ username, password, role });
    setLoading(false);
    
    setUsername('');
    setPassword('');
    setIsFormOpen(false);
  };

  const handleDelete = async (uName: string) => {
    if (uName === 'admin' || uName === currentUser.username) {
        alert('Không thể xóa tài khoản Admin gốc hoặc chính bạn!');
        return;
    }
    if (window.confirm(`Xóa tài khoản ${uName}?`)) {
        await onDeleteUser(uName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Tài khoản</h2>
        <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
            <UserPlus size={20} />
            Thêm User
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-500 animate-fade-in">
             <h3 className="text-lg font-bold text-emerald-700 mb-4">Tạo tài khoản mới</h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quyền</label>
                    <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-2 border rounded-md">
                        <option value="staff">Nhân viên (Staff)</option>
                        <option value="admin">Quản trị (Admin)</option>
                    </select>
                </div>
                <button disabled={loading} type="submit" className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700">
                    {loading ? 'Đang lưu...' : 'Lưu tài khoản'}
                </button>
             </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Password</th>
                    <th className="px-6 py-4">Quyền</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                             <div className="bg-slate-200 p-1 rounded-full"><UserIcon size={14} /></div>
                             {u.username}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono">******</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.role === 'admin' && <Shield size={12} />}
                                {u.role.toUpperCase()}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            {u.username !== 'admin' && u.username !== currentUser.username && (
                                <button onClick={() => handleDelete(u.username)} className="text-slate-400 hover:text-red-600 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;