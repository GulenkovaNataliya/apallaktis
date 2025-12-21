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
  name: string;
  amount?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseCategoryInput {
  name: string;
}

export interface CreateGlobalExpenseInput {
  categoryId: string;
  name: string;
  amount?: string;
  description?: string;
}

export interface UpdateGlobalExpenseInput {
  name?: string;
  amount?: string;
  description?: string;
}
