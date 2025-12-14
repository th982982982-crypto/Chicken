import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2, Calendar, Tag, FileText } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
      return (
          <div className="bg-white p-8 rounded-xl text-center text-slate-400 border border-slate-100 shadow-sm">
              Chưa có dữ liệu nào.
          </div>
      );
  }

  return (
    <>
    {/* Desktop View (Table) */}
    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={t.note}>{t.note}</td>
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
            </tbody>
        </table>
      </div>
    </div>

    {/* Mobile View (Cards) */}
    <div className="md:hidden space-y-3">
        {transactions.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <Calendar size={14} />
                            {t.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === TransactionType.INCOME 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                            {t.type}
                        </span>
                    </div>
                    <button 
                        onClick={() => onDelete(t.id)}
                        className="text-slate-300 hover:text-red-500 p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                     <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Tag size={16} className="text-slate-400" />
                        {t.category}
                     </h4>
                     <span className={`text-lg font-bold ${
                        t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                        {formatCurrency(t.amount)}
                    </span>
                </div>

                {t.quantity > 0 && (
                    <div className="text-xs text-slate-500 mb-2 bg-slate-50 p-2 rounded flex justify-between">
                         <span>SL: <strong>{t.quantity}</strong></span>
                         <span>Đơn giá: <strong>{formatCurrency(t.unitPrice)}</strong></span>
                    </div>
                )}

                {t.note && (
                    <div className="text-sm text-slate-600 flex items-start gap-2 italic">
                        <FileText size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
                        {t.note}
                    </div>
                )}
            </div>
        ))}
    </div>
    </>
  );
};

export default TransactionList;