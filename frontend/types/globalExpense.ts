/**
 * Global Expense Types
 * Типы глобальных расходов
 */

export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalExpense {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string; // Для отображения
  paymentMethodId: string; // Способ оплаты
  paymentMethodName?: string; // Для отображения
  name: string;
  amount: number; // Changed from string to number
  description?: string;
  date: Date; // Дата расхода
  receiptPhotoUrl?: string; // URL фото чека
  receiptPhotoPath?: string; // Путь к файлу в Storage
  inputMethod?: 'manual' | 'voice' | 'photo'; // Способ ввода
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseCategoryInput {
  name: string;
}

export interface CreateGlobalExpenseInput {
  categoryId: string;
  paymentMethodId: string;
  name: string;
  amount: number;
  description?: string;
  date: Date;
  receiptPhotoUrl?: string;
  receiptPhotoPath?: string;
  inputMethod?: 'manual' | 'voice' | 'photo';
}

export interface UpdateGlobalExpenseInput {
  name?: string;
  amount?: string;
  description?: string;
}
