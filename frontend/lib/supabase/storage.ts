/**
 * Supabase Storage Helpers
 * Вспомогательные функции для работы с Supabase Storage
 */

import { createClient } from './client';

const BUCKET_NAME = 'receipt-photos';

/**
 * Upload receipt photo to Supabase Storage
 * Загрузить фото чека в Supabase Storage
 */
export async function uploadReceiptPhoto(
  file: File,
  objectId: string
): Promise<{ url: string; path: string } | null> {
  try {
    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${objectId}/${Date.now()}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return null;
  }
}

/**
 * Delete receipt photo from Supabase Storage
 * Удалить фото чека из Supabase Storage
 */
export async function deleteReceiptPhoto(filePath: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete exception:', error);
    return false;
  }
}

/**
 * Get public URL for receipt photo
 * Получить публичный URL фото чека
 */
export function getReceiptPhotoUrl(filePath: string): string {
  const supabase = createClient();

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
