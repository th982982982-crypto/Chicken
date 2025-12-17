import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      else expense += t.amount;
    });

    return {
      income,
      expense,
      profit: income - expense
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Group by Month-Year
    const grouped: Record<string, { name: string; income: number; expense: number }> = {};
    
    transactions.forEach(t => {
        // Ensure date is valid
        if (!t.date) return;
        const date = new Date(t.date);
        if (isNaN(date.getTime())) return;

        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!grouped[key]) {
            grouped[key] = { name: key, income: 0, expense: 0 };
        }
        if (t.type === TransactionType.INCOME) grouped[key].income += t.amount;
        else grouped[key].expense += t.amount;
    });

    return Object.values(grouped).sort((a, b) => {
        const [m1, y1] = a.name.split('/').map(Number);
        const [m2, y2] = b.name.split('/').map(Number);
        return new Date(y1, m1).getTime() - new Date(y2, m2).getTime();
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Tổng quan nông trại</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-500 font-medium">Tổng thu</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.income)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <ArrowUpCircle size={24} />
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-500 font-medium">Tổng chi</p>
                <p className="text-2xl font-bold text-rose-600">{formatCurrency(stats.expense)}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-full text-rose-600">
                <ArrowDownCircle size={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-500 font-medium">Lợi nhuận</p>
                <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.profit)}
                </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Wallet size={24} />
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-6">Biểu đồ dòng tiền</h3>
        {/* Added min-h-[300px] to ensure Recharts has space to render */}
        <div className="h-64 md:h-80 w-full min-h-[300px]">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `${val / 1000000}M`} tick={{fontSize: 12}} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="income" name="Thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Chi" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    Chưa có dữ liệu biểu đồ
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;