import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { Plus, X, Save } from 'lucide-react';

interface TransactionFormProps {
  fixedType: TransactionType; 
  onAdd: (t: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onAddCategory: (category: string) => Promise<void>;
  availableCategories: string[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ fixedType, onAdd, onAddCategory, availableCategories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const isIncome = fixedType === TransactionType.INCOME;
  const themeColor = isIncome ? 'emerald' : 'rose';
  const labelText = isIncome ? 'Khoản Thu' : 'Khoản Chi';

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [note, setNote] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Auto calculate total amount
  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    setTotalAmount(qty * price);
  }, [quantity, unitPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category.trim()) {
        alert("Vui lòng chọn danh mục!");
        return;
    }
    
    if (totalAmount <= 0) {
        alert("Tổng tiền phải lớn hơn 0");
        return;
    }

    onAdd({
        date: date,
        type: fixedType,
        category: category,
        amount: totalAmount,
        quantity: parseFloat(quantity) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        note: note
    });

    // Reset fields
    setCategory('');
    setQuantity('1');
    setUnitPrice('');
    setNote('');
    setIsOpen(false);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    await onAddCategory(newCategoryName);
    setCategory(newCategoryName);
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  if (!isOpen) {
    return (
        <button 
            onClick={() => setIsOpen(true)}
            className={`w-full md:w-auto flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg transition-colors shadow-sm bg-${themeColor}-600 hover:bg-${themeColor}-700`}
        >
            <Plus size={20} />
            {`Thêm ${labelText} Mới`}
        </button>
    );
  }

  return (
    <div className={`bg-white p-4 md:p-6 rounded-xl shadow-lg border-l-4 border-${themeColor}-500 mb-6 animate-fade-in`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold text-${themeColor}-700`}>{`Ghi nhận ${labelText}`}</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">Đóng</button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày</label>
                <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full border-slate-300 rounded-md shadow-sm focus:border-${themeColor}-500 focus:ring-${themeColor}-500 p-3 md:p-2 border`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                {!isAddingCategory ? (
                    <div className="flex gap-2">
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full border-slate-300 rounded-md shadow-sm focus:border-${themeColor}-500 focus:ring-${themeColor}-500 p-3 md:p-2 border`}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setIsAddingCategory(true)}
                            className={`bg-${themeColor}-100 text-${themeColor}-700 p-2 rounded-md hover:bg-${themeColor}-200 transition-colors flex-shrink-0 w-12 flex items-center justify-center`}
                            title="Thêm danh mục mới"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                         <input 
                            type="text"
                            placeholder="Nhập tên..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className={`w-full border-slate-300 rounded-md shadow-sm focus:border-${themeColor}-500 focus:ring-${themeColor}-500 p-2 border`}
                            autoFocus
                        />
                        <button 
                            type="button" 
                            onClick={handleSaveCategory}
                            className={`p-2 bg-${themeColor}-600 text-white rounded hover:bg-${themeColor}-700`}
                            title="Lưu danh mục"
                        >
                            <Save size={18} />
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                            className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            title="Hủy"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Row for Quantity and Unit Price */}
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                    <input 
                        type="number" 
                        required
                        min="0"
                        step="0.01"
                        placeholder="VD: 10"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className={`w-full border-slate-300 rounded-md shadow-sm focus:border-${themeColor}-500 focus:ring-${themeColor}-500 p-3 md:p-2 border`}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá (VND)</label>
                    <input 
                        type="number" 
                        required
                        min="0"
                        placeholder="VD: 50000"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        className={`w-full border-slate-300 rounded-md shadow-sm focus:border-${themeColor}-500 focus:ring-${themeColor}-500 p-3 md:p-2 border`}
                    />
                </div>
            </div>

            {/* Total Amount (Read only) */}
            <div className="md:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                 <span className="text-sm font-semibold text-slate-600">Thành tiền (Tổng):</span>
                 <span className={`text-xl font-bold text-${themeColor}-600`}>
                    {new Intl.NumberFormat('vi-VN').format(totalAmount)} ₫
                 </span>
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <input 
                    type="text" 
                    placeholder="VD: Chi tiết giao dịch..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`w-full border-slate-300 rounded-md shadow-sm focus:border-${themeColor}-500 focus:ring-${themeColor}-500 p-3 md:p-2 border`}
                />
            </div>

            <div className="md:col-span-2 flex justify-end">
                <button 
                    type="submit"
                    className={`w-full md:w-auto bg-${themeColor}-600 text-white px-6 py-3 md:py-2 rounded-lg hover:bg-${themeColor}-700 transition-colors font-medium shadow-md`}
                >
                    Lưu {labelText}
                </button>
            </div>
        </form>
    </div>
  );
};

export default TransactionForm;