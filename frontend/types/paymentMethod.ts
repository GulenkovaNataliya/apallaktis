/**
 * Payment Method Types
 * Типы способов оплаты
 */

export type PaymentMethodType = 'cash' | 'credit_card' | 'debit_card' | 'bank_account';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  name: string;
  lastFourDigits?: string; // Для карт (последние 4 цифры)
  iban?: string; // Для банковских счетов
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  name: string;
  lastFourDigits?: string;
  iban?: string;
}

export interface UpdatePaymentMethodInput {
  name?: string;
  lastFourDigits?: string;
  iban?: string;
}
