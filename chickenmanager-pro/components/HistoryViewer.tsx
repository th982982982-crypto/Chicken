import React, { useState, useEffect } from 'react';
import { api } from '../services/storageService';
import { Transaction, TransactionType } from '../types';
import TransactionList from './TransactionList';
import { Loader2, History, ArrowDownCircle, ArrowUpCircle, Wallet, Calendar } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

const HistoryViewer: React.FC = () => {
    const [batches, setBatches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const loadBatches = async () => {
            setLoadingBatches(true);
            try {
                const data = await api.fetchArchivedBatches();
                
                if (Array.isArray(data)) {
                     const safeBatches = data.map((item: any) => {
                         if (typeof item === 'string') return item;
                         if (item === null || item === undefined) return '';
                         
                         // Try to find a meaningful property if it is an object
                         if (typeof item === 'object') {
                             return item.name || item.batchName || item.label || item.id || JSON.stringify(item);
                         }
                         return String(item);
                     }).filter(s => s !== ''); 

                     setBatches(safeBatches);
                }
            } catch (error) {
                console.error("Failed to load batches", error);
            } finally {
                setLoadingBatches(false);
            }
        };
        loadBatches();
    }, []);

    const handleBatchChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const batch = e.target.value;
        setSelectedBatch(batch);
        if (!batch) {
            setTransactions([]);
            return;
        }

        setLoadingData(true);
        try {
            // NOTE: api.fetchTransactions now handles encoding internally
            const data = await api.fetchTransactions(`Archive_${batch}`);
            setTransactions(data);
        } catch (error) {
            console.error("Failed to load archived transactions", error);
            alert("Lỗi khi tải dữ liệu lịch sử");
        } finally {
            setLoadingData(false);
        }
    };

    // Calculate Summary
    const summary = React.useMemo(() => {
        let income = 0;
        let expense = 0;
        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, profit: income - expense };
    }, [transactions]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <History className="text-indigo-600" />
                    Lịch sử các đợt cũ
                </h2>
                
                <div className="w-full md:w-80">
                    {loadingBatches ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Loader2 className="animate-spin" size={16} /> Đang tải danh sách...
                        </div>
                    ) : (
                        <div className="relative group">
                            <Calendar size={18} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
                            <select 
                                value={selectedBatch} 
                                onChange={handleBatchChange}
                                className="w-full pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800 shadow-sm appearance-none font-medium text-sm truncate"
                            >
                                <option value="" className="text-slate-400">-- Chọn đợt kết sổ --</option>
                                {batches.length > 0 ? (
                                    batches.map((b, idx) => (
                                        <option key={`${b}-${idx}`} value={b} className="text-slate-800 py-1">
                                            {b}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Chưa có dữ liệu cũ</option>
                                )}
                            </select>
                            {/* Custom Arrow */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedBatch && (
                <>
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Loader2 size={40} className="animate-spin text-indigo-500 mb-2" />
                        <p>Đang tải dữ liệu lưu trữ...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Tổng thu đợt này</p>
                                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.income)}</p>
                                </div>
                                <ArrowUpCircle className="text-emerald-100 bg-emerald-600 rounded-full p-1" size={32} />
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Tổng chi đợt này</p>
                                    <p className="text-xl font-bold text-rose-600">{formatCurrency(summary.expense)}</p>
                                </div>
                                <ArrowDownCircle className="text-rose-100 bg-rose-600 rounded-full p-1" size={32} />
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Lợi nhuận ròng</p>
                                    <p className={`text-xl font-bold ${summary.profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                        {formatCurrency(summary.profit)}
                                    </p>
                                </div>
                                <Wallet className="text-blue-100 bg-blue-600 rounded-full p-1" size={32} />
                            </div>
                        </div>

                        {/* Transaction List (Read Only) */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">Chi tiết giao dịch</h3>
                            <TransactionList transactions={transactions} />
                        </div>
                    </>
                )}
                </>
            )}
            
            {!selectedBatch && !loadingBatches && (
                <div className="text-center py-12 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-500">
                    <History size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Vui lòng chọn một đợt sổ cũ để xem lại dữ liệu.</p>
                </div>
            )}
        </div>
    );
};

export default HistoryViewer;