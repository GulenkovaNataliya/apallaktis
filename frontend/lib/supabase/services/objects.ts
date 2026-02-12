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
  deleted_at: string | null;
  version: number;
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
 * Получить все объекты пользователя (кроме удалённых)
 */
export async function getObjects(userId: string): Promise<PropertyObject[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }

  return data || [];
}

/**
 * Получить удалённые объекты (корзина)
 */
export async function getDeletedObjects(userId: string): Promise<PropertyObject[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .eq('user_id', userId)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (error) {
    console.error('Error fetching deleted objects:', error);
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
 * Создать новый объект.
 * Routes through /api/objects for server-side subscription limit enforcement.
 */
export async function createObject(
  userId: string,
  input: CreateObjectInput
): Promise<PropertyObject> {
  console.log('createObject - calling API:', { userId, input });

  const res = await fetch('/api/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('createObject - API error:', json);
    throw new Error(json.error || 'Failed to create object');
  }

  console.log('createObject - result:', json.data);
  return json.data;
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
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    console.error('Error updating object:', error);
    throw error;
  }

  return data;
}

/**
 * Обновить объект с проверкой версии (optimistic locking)
 */
export async function updateObjectWithVersion(
  objectId: string,
  userId: string,
  input: UpdateObjectInput,
  expectedVersion: number
): Promise<{ success: boolean; data?: PropertyObject; conflict?: boolean }> {
  const supabase = createClient();

  // Сначала проверим текущую версию
  const { data: current, error: checkError } = await supabase
    .from('objects')
    .select('version')
    .eq('id', objectId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (checkError) {
    console.error('Error checking object version:', checkError);
    throw checkError;
  }

  if (!current) {
    throw new Error('Object not found');
  }

  if (current.version !== expectedVersion) {
    // Конфликт версий
    return { success: false, conflict: true };
  }

  // Обновляем (триггер автоматически увеличит версию)
  const { data, error } = await supabase
    .from('objects')
    .update(input)
    .eq('id', objectId)
    .eq('user_id', userId)
    .eq('version', expectedVersion)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Кто-то уже обновил объект
      return { success: false, conflict: true };
    }
    console.error('Error updating object with version:', error);
    throw error;
  }

  return { success: true, data };
}

/**
 * Soft delete объекта (перемещение в корзину)
 */
export async function deleteObject(
  objectId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  // Используем RPC функцию soft_delete_object
  const { data, error } = await supabase
    .rpc('soft_delete_object', {
      p_object_id: objectId,
      p_user_id: userId
    });

  if (error) {
    console.error('Error soft deleting object:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Object not found or already deleted');
  }
}

/**
 * Восстановить объект из корзины
 */
export async function restoreObject(
  objectId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  // Используем RPC функцию restore_object
  const { data, error } = await supabase
    .rpc('restore_object', {
      p_object_id: objectId,
      p_user_id: userId
    });

  if (error) {
    console.error('Error restoring object:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Object not found or not deleted');
  }
}

/**
 * Удалить объект навсегда
 */
export async function permanentlyDeleteObject(
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
    console.error('Error permanently deleting object:', error);
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
