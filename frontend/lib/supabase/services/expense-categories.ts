/**
 * Expense Categories Service
 * CRUD операции для категорий расходов через Supabase
 */

import { createClient } from '../client';

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string | { el: string; en: string }; // Может быть строка или мультиязычный объект
  created_at: string;
}

export interface CreateExpenseCategoryInput {
  name: string | { el: string; en: string };
}

export interface UpdateExpenseCategoryInput {
  name?: string | { el: string; en: string };
}

/**
 * Получить все категории пользователя
 */
export async function getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Создать новую категорию
 */
export async function createExpenseCategory(
  userId: string,
  input: CreateExpenseCategoryInput
): Promise<ExpenseCategory> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      user_id: userId,
      name: input.name,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating expense category:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить категорию
 */
export async function updateExpenseCategory(
  categoryId: string,
  userId: string,
  input: UpdateExpenseCategoryInput
): Promise<ExpenseCategory> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('expense_categories')
    .update(input)
    .eq('id', categoryId)
    .eq('user_id', userId) // Проверка владельца
    .select()
    .single();

  if (error) {
    console.error('Error updating expense category:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить категорию
 */
export async function deleteExpenseCategory(
  categoryId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('expense_categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId); // Проверка владельца

  if (error) {
    console.error('Error deleting expense category:', error);
    throw error;
  }
}

/**
 * Получить одну категорию по ID
 */
export async function getExpenseCategoryById(
  categoryId: string,
  userId: string
): Promise<ExpenseCategory | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('id', categoryId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching expense category:', error);
    throw error;
  }

  return data;
}
