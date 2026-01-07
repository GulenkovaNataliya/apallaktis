/**
 * Object Expense Types
 * Типы расходов объектов (материалы, инструменты, транспорт и т.д.)
 */

export interface ObjectExpense {
  id: string;
  objectId: string; // Привязка к объекту
  categoryId: string; // Категория расхода
  categoryName?: string; // Для отображения
  paymentMethodId: string; // Способ оплаты
  paymentMethodName?: string; // Для отображения
  amount: number; // Сумма в евро
  description?: string; // Описание расхода
  date: Date; // Дата расхода
  receiptPhotoUrl?: string; // URL фото чека в Supabase Storage
  receiptPhotoPath?: string; // Путь к файлу в Storage для удаления
  inputMethod?: 'manual' | 'voice' | 'photo'; // Способ ввода
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateObjectExpenseInput {
  objectId: string;
  categoryId: string;
  paymentMethodId: string;
  amount: number;
  description?: string;
  date: Date;
  receiptPhotoUrl?: string;
  receiptPhotoPath?: string;
  inputMethod?: 'manual' | 'voice' | 'photo';
}

export interface UpdateObjectExpenseInput {
  categoryId?: string;
  amount?: number;
  description?: string;
  date?: Date;
  receiptPhotoUrl?: string;
  receiptPhotoPath?: string;
}
