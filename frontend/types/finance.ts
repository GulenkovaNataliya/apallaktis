/**
 * Finance Types
 * Типы для финансовых операций объектов
 */

/**
 * Дополнительная работа (дополнительная цена)
 */
export interface AdditionalWork {
  id: string;
  objectId: string;
  date: Date;
  amount: number;
  description: string;
  createdAt: Date;
}

/**
 * Оплата от клиента
 */
export interface Payment {
  id: string;
  objectId: string;
  date: Date;
  amount: number;
  paymentMethodId: string; // ID способа оплаты
  description?: string;
  createdAt: Date;
}

/**
 * Финансы объекта (агрегированные данные)
 */
export interface ObjectFinance {
  objectId: string;
  contractPrice: number; // Договорная цена (из объекта)
  additionalWorks: AdditionalWork[]; // Дополнительные работы
  payments: Payment[]; // Оплаты от клиента

  // Вычисляемые поля
  totalAdditionalWorks: number; // Сумма всех доп. работ
  totalPayments: number; // Сумма всех оплат
  balance: number; // Баланс: contractPrice + totalAdditionalWorks - totalPayments
  balanceStatus: 'debt' | 'closed' | 'overpaid'; // Статус: долг/закрыто/переплата
}

/**
 * Входные данные для создания дополнительной работы
 */
export interface CreateAdditionalWorkInput {
  objectId: string;
  date: Date;
  amount: number;
  description: string;
}

/**
 * Входные данные для создания оплаты
 */
export interface CreatePaymentInput {
  objectId: string;
  date: Date;
  amount: number;
  paymentMethodId: string;
  description?: string;
}
