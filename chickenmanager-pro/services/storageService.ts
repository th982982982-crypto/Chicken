import { Transaction, DEFAULT_CATEGORIES, User, AppConfig } from '../types';

const STORAGE_KEY = 'chicken_farm_data';
const CATEGORY_KEY = 'chicken_farm_categories';
const CONFIG_KEY = 'chicken_farm_config';

// Hardcoded Web App URL provided by user
const DEFAULT_GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwLewoR1c0F9jlt8dvf_URVfRKDUSszgdlzYoJ6l8nJkaRaU7WWC378nUAOZ0Ba9MWg/exec';

// Initial Mock Data
const INITIAL_DATA: Transaction[] = [
  { id: '1', date: '2023-10-01', type: 'CHI' as any, category: 'Gà giống', amount: 5000000, quantity: 200, unitPrice: 25000, note: 'Nhập 200 con giống', timestamp: 1696118400000 },
  { id: '2', date: '2023-10-05', type: 'CHI' as any, category: 'Thức ăn', amount: 2000000, quantity: 4, unitPrice: 500000, note: 'Cám giai đoạn 1', timestamp: 1696464000000 },
];

// --- Config Methods ---

export const getConfig = (): AppConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) {
    return {
      gasWebAppUrl: DEFAULT_GAS_WEB_APP_URL,
      useCloud: true // Default to true now
    };
  }
  return JSON.parse(stored);
};

export const saveConfig = (config: AppConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

// Helper to get dynamic URL
const getApiUrl = (): string => {
  const config = getConfig();
  return config.gasWebAppUrl || DEFAULT_GAS_WEB_APP_URL;
};

// --- Local Storage Methods ---

export const getLocalTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(stored);
};

export const saveLocalTransaction = (transaction: Transaction): Transaction[] => {
  const current = getLocalTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteLocalTransaction = (id: string): Transaction[] => {
  const current = getLocalTransactions();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// --- Category Local Storage ---

export const getLocalCategories = (): string[] => {
  const stored = localStorage.getItem(CATEGORY_KEY);
  if (!stored) {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(stored);
};

export const saveLocalCategory = (newCategory: string): string[] => {
  const current = getLocalCategories();
  if (!current.includes(newCategory)) {
    const updated = [...current, newCategory];
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
};


// --- Google Apps Script API Methods ---

export const api = {
  fetchTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${getApiUrl()}?type=transactions`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  fetchCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${getApiUrl()}?type=categories`);
      const data = await response.json();
      // If cloud returns empty array (rare if initialized), fallback to default
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return DEFAULT_CATEGORIES;
    }
  },

  fetchUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${getApiUrl()}?type=users`);
      const data = await response.json();
      
      // Validation: Check if it's actually a user array (has username)
      // This prevents issues if the API returns Transactions by mistake (old script)
      if (Array.isArray(data) && data.length > 0 && 'username' in data[0]) {
          return data;
      } else if (Array.isArray(data) && data.length === 0) {
          // Empty users table in sheet, fallback to default admin
          return [{ username: 'admin', password: '123', role: 'admin' }];
      }

      console.warn("API returned invalid user data, falling back to default.");
      return [{ username: 'admin', password: '123', role: 'admin' }];
    } catch (error) {
      console.error("Error fetching users (Network/Parse error):", error);
      // Critical Fallback: Return default admin so user can at least login and check settings
      return [{ username: 'admin', password: '123', role: 'admin' }];
    }
  },

  addTransaction: async (transaction: Transaction): Promise<void> => {
    await fetch(getApiUrl(), {
      method: 'POST',
      body: JSON.stringify({ action: 'create', data: transaction }),
    });
  },

  addCategory: async (category: string): Promise<void> => {
    await fetch(getApiUrl(), {
      method: 'POST',
      body: JSON.stringify({ action: 'create_category', category: category }),
    });
  },

  addUser: async (user: User): Promise<void> => {
    await fetch(getApiUrl(), {
      method: 'POST',
      body: JSON.stringify({ action: 'create_user', user: user }),
    });
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await fetch(getApiUrl(), {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id: id }),
    });
  },

  deleteUser: async (username: string): Promise<void> => {
    await fetch(getApiUrl(), {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_user', username: username }),
    });
  }
};


// --- GAS Code Template ---
export const getGASCodeTemplate = () => {
  return `
// ==================================================
// APP SCRIPT CHO CHICKEN MANAGER PRO (FINAL)
// ==================================================

function doGet(e) {
  const type = e.parameter.type || 'transactions';
  
  return handleResponse(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- LẤY DANH SÁCH DANH MỤC ---
    if (type === 'categories') {
      const sheet = getOrCreateSheet(ss, 'Categories');
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
         return []; 
      }
      const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const categories = data.flat().filter(function(cell) { return cell !== ""; });
      return categories;
    }
    
    // --- LẤY DANH SÁCH USER ---
    if (type === 'users') {
      const sheet = getOrCreateSheet(ss, 'Users');
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return [];
      return data.slice(1).map(row => ({
        username: String(row[0]),
        password: String(row[1]),
        role: String(row[2])
      })).filter(u => u.username);
    }

    // --- LẤY GIAO DỊCH (MẶC ĐỊNH) ---
    const sheet = getOrCreateSheet(ss, 'Transactions');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];

    const transactions = data.slice(1).map(row => ({
      id: String(row[0]),
      date: formatDate(row[1]), 
      type: row[2],
      category: row[3],
      amount: Number(row[4]),
      note: row[5],
      timestamp: Number(row[6]),
      quantity: Number(row[7] || 1),    
      unitPrice: Number(row[8] || row[4]) 
    })).filter(t => t.id && t.amount);

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  });
}

function doPost(e) {
  return handleResponse(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'create';

    // --- TẠO GIAO DỊCH MỚI ---
    if (action === 'create') {
      const sheet = getOrCreateSheet(ss, 'Transactions');
      sheet.appendRow([
        body.data.id,
        body.data.date,
        body.data.type,
        body.data.category,
        body.data.amount,
        body.data.note,
        body.data.timestamp,
        body.data.quantity, 
        body.data.unitPrice 
      ]);
      return { status: 'success' };
    }
    
    // --- TẠO DANH MỤC MỚI ---
    if (action === 'create_category') {
      const sheet = getOrCreateSheet(ss, 'Categories');
      const newCat = String(body.category).trim();
      
      if (!newCat) return { status: 'error', message: 'Empty category' };

      const data = sheet.getDataRange().getValues();
      const exists = data.some(row => String(row[0]).toLowerCase() === newCat.toLowerCase());
      
      if (!exists) {
        sheet.appendRow([newCat, new Date()]);
        return { status: 'success', message: 'Category added' };
      }
      return { status: 'success', message: 'Category already exists' };
    }

    // --- TẠO USER MỚI ---
    if (action === 'create_user') {
      const sheet = getOrCreateSheet(ss, 'Users');
      const u = body.user;
      const data = sheet.getDataRange().getValues();
      const exists = data.some(row => String(row[0]) === u.username);
      if (exists) return { status: 'error', message: 'User exists' };
      
      sheet.appendRow([u.username, u.password, u.role, new Date()]);
      return { status: 'success' };
    }
    
    // --- XÓA GIAO DỊCH ---
    if (action === 'delete') {
      const sheet = getOrCreateSheet(ss, 'Transactions');
      deleteRowByCol(sheet, 0, String(body.id));
      return { status: 'success' };
    }

    // --- XÓA USER ---
    if (action === 'delete_user') {
      const sheet = getOrCreateSheet(ss, 'Users');
      deleteRowByCol(sheet, 0, String(body.username));
      return { status: 'success' };
    }
  });
}

function deleteRowByCol(sheet, colIndex, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][colIndex]) === value) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Transactions') {
      sheet.appendRow(['ID', 'Date', 'Type', 'Category', 'Total Amount', 'Note', 'Timestamp', 'Quantity', 'Unit Price']);
    } else if (name === 'Categories') {
      sheet.appendRow(['Category Name', 'Created Date']);
      const defaults = ['Bán Gà', 'Bán Trứng', 'Thức ăn', 'Thuốc men', 'Gà giống', 'Dụng cụ', 'Khác'];
      defaults.forEach(d => sheet.appendRow([d, new Date()]));
    } else if (name === 'Users') {
      sheet.appendRow(['Username', 'Password', 'Role', 'CreatedDate']);
      sheet.appendRow(['admin', '123', 'admin', new Date()]);
    }
  }
  return sheet;
}

function handleResponse(callback) {
  try {
    const result = callback();
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date.getMonth === 'function') {
     var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
  return String(date);
}
  `;
};
