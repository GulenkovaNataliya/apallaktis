import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AdminAction =
  | 'activate_vip'
  | 'revoke_vip'
  | 'block_user'
  | 'unblock_user'
  | 'extend_subscription'
  | 'refund_payment'
  | 'delete_user'
  | 'update_user';

interface LogActionParams {
  adminId: string;
  action: AdminAction;
  targetUserId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Логирует действие администратора в таблицу admin_actions_log
 *
 * @example
 * await logAdminAction({
 *   adminId: session.user.id,
 *   action: 'activate_vip',
 *   targetUserId: userId,
 *   metadata: { duration: '1month', reason: 'За помощь' },
 *   ipAddress: request.ip,
 *   userAgent: request.headers['user-agent']
 * });
 */
export async function logAdminAction({
  adminId,
  action,
  targetUserId,
  metadata = {},
  ipAddress,
  userAgent,
}: LogActionParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_actions_log')
      .insert({
        admin_id: adminId,
        action,
        target_user_id: targetUserId,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Failed to log admin action:', error);
      // Не прерываем выполнение, если логирование не удалось
      // Это не критичная ошибка
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

/**
 * Получает историю действий администратора
 *
 * @param adminId - ID администратора (опционально, если не указан - вернёт все логи)
 * @param limit - Количество записей (по умолчанию 50)
 */
export async function getAdminActionHistory(
  adminId?: string,
  limit: number = 50
) {
  try {
    let query = supabase
      .from('admin_actions_log')
      .select(`
        *,
        admin:admin_id (email, name),
        target_user:target_user_id (email, name, account_number)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get admin action history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting admin action history:', error);
    return [];
  }
}

/**
 * Получает действия над конкретным пользователем
 *
 * @param targetUserId - ID целевого пользователя
 * @param limit - Количество записей (по умолчанию 20)
 */
export async function getUserActionHistory(
  targetUserId: string,
  limit: number = 20
) {
  try {
    const { data, error } = await supabase
      .from('admin_actions_log')
      .select(`
        *,
        admin:admin_id (email, name)
      `)
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get user action history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user action history:', error);
    return [];
  }
}
