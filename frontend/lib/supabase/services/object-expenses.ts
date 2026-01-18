/**
 * Object Expenses Service
 * CRUD операции для расходов по объектам через Supabase
 */

import { createClient } from '../client';
import type { InputMethod } from './global-expenses';

export interface ObjectExpense {
  id: string;
  object_id: string;
  category_id: string | null;
  payment_method_id: string | null;
  name: string;
  amount: number;
  description: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  input_method: InputMethod | null;
  created_at: string;
}

export interface CreateObjectExpenseInput {
  object_id: string;
  category_id?: string | null;
  payment_method_id?: string | null;
  name: string;
  amount: number;
  description?: string | null;
  date: string; // YYYY-MM-DD
  input_method?: InputMethod | null;
}

export interface UpdateObjectExpenseInput {
  category_id?: string | null;
  payment_method_id?: string | null;
  name?: string;
  amount?: number;
  description?: string | null;
  date?: string;
  input_method?: InputMethod | null;
}

/**
 * Получить все расходы по объекту
 */
export async function getObjectExpenses(objectId: string): Promise<ObjectExpense[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .select('*')
    .eq('object_id', objectId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching object expenses:', error);
    throw error;
  }

  return data || [];
}

/**
 * Получить расходы объекта с фильтрацией по дате
 */
export async function getObjectExpensesByDateRange(
  objectId: string,
  startDate: string,
  endDate: string
): Promise<ObjectExpense[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .select('*')
    .eq('object_id', objectId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching object expenses by date range:', error);
    throw error;
  }

  return data || [];
}

/**
 * Создать новый расход по объекту
 */
export async function createObjectExpense(
  input: CreateObjectExpenseInput
): Promise<ObjectExpense> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .insert({
      object_id: input.object_id,
      category_id: input.category_id || null,
      payment_method_id: input.payment_method_id || null,
      name: input.name,
      amount: input.amount,
      description: input.description || null,
      date: input.date,
      input_method: input.input_method || 'manual',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating object expense:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить расход объекта
 */
export async function updateObjectExpense(
  expenseId: string,
  objectId: string,
  input: UpdateObjectExpenseInput
): Promise<ObjectExpense> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .update(input)
    .eq('id', expenseId)
    .eq('object_id', objectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating object expense:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить расход объекта
 */
export async function deleteObjectExpense(
  expenseId: string,
  objectId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('object_expenses')
    .delete()
    .eq('id', expenseId)
    .eq('object_id', objectId);

  if (error) {
    console.error('Error deleting object expense:', error);
    throw error;
  }
}

/**
 * Получить один расход по ID
 */
export async function getObjectExpenseById(
  expenseId: string,
  objectId: string
): Promise<ObjectExpense | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .select('*')
    .eq('id', expenseId)
    .eq('object_id', objectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching object expense:', error);
    throw error;
  }

  return data;
}

/**
 * Получить общую сумму расходов по объекту
 */
export async function getObjectExpensesTotal(objectId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .select('amount')
    .eq('object_id', objectId);

  if (error) {
    console.error('Error fetching object expenses total:', error);
    throw error;
  }

  return (data || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
}

/**
 * Получить расходы по нескольким объектам (для экспорта)
 */
export async function getExpensesByObjectIds(
  objectIds: string[]
): Promise<ObjectExpense[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_expenses')
    .select('*')
    .in('object_id', objectIds)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses by object IDs:', error);
    throw error;
  }

  return data || [];
}
