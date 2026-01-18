/**
 * Object Payments Service
 * CRUD операции для платежей от клиента через Supabase
 */

import { createClient } from '../client';

export interface ObjectPayment {
  id: string;
  object_id: string;
  payment_method_id: string | null;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
}

export interface CreateObjectPaymentInput {
  object_id: string;
  payment_method_id?: string | null;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface UpdateObjectPaymentInput {
  payment_method_id?: string | null;
  amount?: number;
  date?: string;
}

/**
 * Получить все платежи по объекту
 */
export async function getObjectPayments(objectId: string): Promise<ObjectPayment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_payments')
    .select('*')
    .eq('object_id', objectId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching object payments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Создать новый платёж
 */
export async function createObjectPayment(
  input: CreateObjectPaymentInput
): Promise<ObjectPayment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_payments')
    .insert({
      object_id: input.object_id,
      payment_method_id: input.payment_method_id || null,
      amount: input.amount,
      date: input.date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating object payment:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить платёж
 */
export async function updateObjectPayment(
  paymentId: string,
  objectId: string,
  input: UpdateObjectPaymentInput
): Promise<ObjectPayment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_payments')
    .update(input)
    .eq('id', paymentId)
    .eq('object_id', objectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating object payment:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить платёж
 */
export async function deleteObjectPayment(
  paymentId: string,
  objectId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('object_payments')
    .delete()
    .eq('id', paymentId)
    .eq('object_id', objectId);

  if (error) {
    console.error('Error deleting object payment:', error);
    throw error;
  }
}

/**
 * Получить общую сумму платежей по объекту
 */
export async function getObjectPaymentsTotal(objectId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_payments')
    .select('amount')
    .eq('object_id', objectId);

  if (error) {
    console.error('Error fetching object payments total:', error);
    throw error;
  }

  return (data || []).reduce((sum, payment) => sum + Number(payment.amount), 0);
}
