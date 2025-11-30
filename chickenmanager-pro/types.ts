export enum TransactionType {
  INCOME = 'THU',
  EXPENSE = 'CHI'
}

// Default categories just for initialization, but now we support dynamic strings
export const DEFAULT_CATEGORIES = [
  'Bán Gà',
  'Bán Trứng',
  'Thức ăn',
  'Thuốc men',
  'Gà giống',
  'Dụng cụ',
  'Điện nước',
  'Khác'
];

export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  type: TransactionType;
  category: string; // Changed from enum to string to support dynamic categories
  amount: number; // Total amount (Quantity * Unit Price)
  quantity: number; // New field
  unitPrice: number; // New field
  note: string;
  timestamp: number;
}

export interface User {
  username: string;
  password?: string; // Optional for display, required for storage
  role: 'admin' | 'staff';
}

export interface AppConfig {
  gasWebAppUrl: string;
  useCloud: boolean;
}