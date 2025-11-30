import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Ngày</th>
                    <th className="px-6 py-4">Loại</th>
                    <th className="px-6 py-4">Danh mục</th>
                    <th className="px-6 py-4">Chi tiết (SL x Đơn giá)</th>
                    <th className="px-6 py-4">Ghi chú</th>
                    <th className="px-6 py-4 text-right">Tổng tiền</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{t.date}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                t.type === TransactionType.INCOME 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                                {t.type}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{t.category}</td>
                        <td className="px-6 py-4 text-slate-600">
                            {t.quantity && t.unitPrice ? (
                                <div className="flex flex-col">
                                    <span className="font-semibold text-xs">SL: {t.quantity}</span>
                                    <span className="text-xs text-slate-400">ĐG: {formatCurrency(t.unitPrice)}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{t.note}</td>
                        <td className={`px-6 py-4 text-right font-bold ${
                            t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                            {formatCurrency(t.amount)} ₫
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => onDelete(t.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
                {transactions.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                            Chưa có dữ liệu nào.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;