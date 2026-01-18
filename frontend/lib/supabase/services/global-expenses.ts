/**
 * Global Expenses Service
 * CRUD операции для глобальных расходов через Supabase
 */

import { createClient } from '../client';

export type InputMethod = 'manual' | 'voice' | 'photo';

export interface GlobalExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  payment_method_id: string | null;
  name: string;
  amount: number;
  description: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  input_method: InputMethod | null;
  created_at: string;
}

export interface CreateGlobalExpenseInput {
  category_id?: string | null;
  payment_method_id?: string | null;
  name: string;
  amount: number;
  description?: string | null;
  date: string; // YYYY-MM-DD
  input_method?: InputMethod | null;
}

export interface UpdateGlobalExpenseInput {
  category_id?: string | null;
  payment_method_id?: string | null;
  name?: string;
  amount?: number;
  description?: string | null;
  date?: string;
  input_method?: InputMethod | null;
}

/**
 * Получить все глобальные расходы пользователя
 */
export async function getGlobalExpenses(userId: string): Promise<GlobalExpense[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching global expenses:', error);
    throw error;
  }

  return data || [];
}

/**
 * Получить глобальные расходы с фильтрацией по дате
 */
export async function getGlobalExpensesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<GlobalExpense[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching global expenses by date range:', error);
    throw error;
  }

  return data || [];
}

/**
 * Создать новый глобальный расход
 */
export async function createGlobalExpense(
  userId: string,
  input: CreateGlobalExpenseInput
): Promise<GlobalExpense> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_expenses')
    .insert({
      user_id: userId,
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
    console.error('Error creating global expense:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить глобальный расход
 */
export async function updateGlobalExpense(
  expenseId: string,
  userId: string,
  input: UpdateGlobalExpenseInput
): Promise<GlobalExpense> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_expenses')
    .update(input)
    .eq('id', expenseId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating global expense:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить глобальный расход
 */
export async function deleteGlobalExpense(
  expenseId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('global_expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting global expense:', error);
    throw error;
  }
}

/**
 * Получить один расход по ID
 */
export async function getGlobalExpenseById(
  expenseId: string,
  userId: string
): Promise<GlobalExpense | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_expenses')
    .select('*')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching global expense:', error);
    throw error;
  }

  return data;
}

/**
 * Получить сумму расходов по категориям
 */
export async function getGlobalExpensesSummaryByCategory(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ category_id: string | null; total: number }[]> {
  const supabase = createClient();

  let query = supabase
    .from('global_expenses')
    .select('category_id, amount')
    .eq('user_id', userId);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching expenses summary:', error);
    throw error;
  }

  // Группируем и суммируем на клиенте
  const summary: Record<string, number> = {};
  for (const expense of data || []) {
    const key = expense.category_id || 'uncategorized';
    summary[key] = (summary[key] || 0) + Number(expense.amount);
  }

  return Object.entries(summary).map(([category_id, total]) => ({
    category_id: category_id === 'uncategorized' ? null : category_id,
    total,
  }));
}
