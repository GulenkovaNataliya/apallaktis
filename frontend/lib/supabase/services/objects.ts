/**
 * Objects Service
 * CRUD операции для объектов (строек) через Supabase
 */

import { createClient } from '../client';

export type ObjectStatus = 'open' | 'closed';

export interface PropertyObject {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  client_name: string | null;
  client_contact: string | null;
  contract_price: number;
  status: ObjectStatus;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectInput {
  name: string;
  address?: string | null;
  client_name?: string | null;
  client_contact?: string | null;
  contract_price?: number;
  status?: ObjectStatus;
  color?: string | null;
}

export interface UpdateObjectInput {
  name?: string;
  address?: string | null;
  client_name?: string | null;
  client_contact?: string | null;
  contract_price?: number;
  status?: ObjectStatus;
  color?: string | null;
}

/**
 * Получить все объекты пользователя
 */
export async function getObjects(userId: string): Promise<PropertyObject[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }

  return data || [];
}

/**
 * Получить объект по ID
 */
export async function getObjectById(
  objectId: string,
  userId: string
): Promise<PropertyObject | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .eq('id', objectId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching object:', error);
    throw error;
  }

  return data;
}

/**
 * Создать новый объект
 */
export async function createObject(
  userId: string,
  input: CreateObjectInput
): Promise<PropertyObject> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .insert({
      user_id: userId,
      name: input.name,
      address: input.address || null,
      client_name: input.client_name || null,
      client_contact: input.client_contact || null,
      contract_price: input.contract_price || 0,
      status: input.status || 'open',
      color: input.color || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating object:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить объект
 */
export async function updateObject(
  objectId: string,
  userId: string,
  input: UpdateObjectInput
): Promise<PropertyObject> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .update(input)
    .eq('id', objectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating object:', error);
    throw error;
  }

  return data;
}

/**
 * Удалить объект
 */
export async function deleteObject(
  objectId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('objects')
    .delete()
    .eq('id', objectId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
}

/**
 * Получить количество объектов пользователя
 */
export async function getObjectsCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('objects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting objects:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Получить объекты по статусу
 */
export async function getObjectsByStatus(
  userId: string,
  status: ObjectStatus
): Promise<PropertyObject[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching objects by status:', error);
    throw error;
  }

  return data || [];
}
