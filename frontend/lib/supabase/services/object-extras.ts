/**
 * Object Extras Service
 * CRUD операции для дополнительных работ (additionalWorks) через Supabase
 */

import { createClient } from '../client';

export interface ObjectExtra {
  id: string;
  object_id: string;
  amount: number;
  description: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
}

export interface CreateObjectExtraInput {
  object_id: string;
  amount: number;
  description?: string | null;
  date: string; // YYYY-MM-DD
}

export interface UpdateObjectExtraInput {
  amount?: number;
  description?: string | null;
  date?: string;
}

/**
 * Получить все дополнительные работы по объекту
 */
export async function getObjectExtras(objectId: string): Promise<ObjectExtra[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_extras')
    .select('*')
    .eq('object_id', objectId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching object extras:', error);
    throw error;
  }

  return data || [];
}

/**
 * Создать новую дополнительную работу
 */
export async function createObjectExtra(
  input: CreateObjectExtraInput
): Promise<ObjectExtra> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_extras')
    .insert({
      object_id: input.object_id,
      amount: input.amount,
      description: input.description || null,
      date: input.date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating object extra:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить дополнительную работу
 */
export async function updateObjectExtra(
  extraId: string,
  objectId: string,
  input: UpdateObjectExtraInput
): Promise<ObjectExtra> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_extras')
    .update(input)
    .eq('id', extraId)
    .eq('object_id', objectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating object extra:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить дополнительную работу
 */
export async function deleteObjectExtra(
  extraId: string,
  objectId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('object_extras')
    .delete()
    .eq('id', extraId)
    .eq('object_id', objectId);

  if (error) {
    console.error('Error deleting object extra:', error);
    throw error;
  }
}

/**
 * Получить общую сумму дополнительных работ по объекту
 */
export async function getObjectExtrasTotal(objectId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('object_extras')
    .select('amount')
    .eq('object_id', objectId);

  if (error) {
    console.error('Error fetching object extras total:', error);
    throw error;
  }

  return (data || []).reduce((sum, extra) => sum + Number(extra.amount), 0);
}
