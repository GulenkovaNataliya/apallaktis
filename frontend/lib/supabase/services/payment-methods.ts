/**
 * Payment Methods Service
 * CRUD операции для способов оплаты через Supabase
 */

import { createClient } from '../client';

export type PaymentMethodType = 'cash' | 'credit_card' | 'debit_card' | 'bank_account';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: PaymentMethodType;
  name: string;
  last_four_digits?: string | null;
  iban?: string | null;
  created_at: string;
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  name: string;
  last_four_digits?: string;
  iban?: string;
}

export interface UpdatePaymentMethodInput {
  type?: PaymentMethodType;
  name?: string;
  last_four_digits?: string;
  iban?: string;
}

/**
 * Получить все способы оплаты пользователя
 */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }

  return data || [];
}

/**
 * Создать новый способ оплаты
 */
export async function createPaymentMethod(
  userId: string,
  input: CreatePaymentMethodInput
): Promise<PaymentMethod> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      type: input.type,
      name: input.name,
      last_four_digits: input.last_four_digits || null,
      iban: input.iban || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить способ оплаты
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  userId: string,
  input: UpdatePaymentMethodInput
): Promise<PaymentMethod> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('payment_methods')
    .update(input)
    .eq('id', paymentMethodId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить способ оплаты
 */
export async function deletePaymentMethod(
  paymentMethodId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}

/**
 * Получить один способ оплаты по ID
 */
export async function getPaymentMethodById(
  paymentMethodId: string,
  userId: string
): Promise<PaymentMethod | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', paymentMethodId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching payment method:', error);
    throw error;
  }

  return data;
}
