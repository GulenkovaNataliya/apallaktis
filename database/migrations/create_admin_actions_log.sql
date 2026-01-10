-- Migration: Create Admin Actions Log
-- ========================================
-- Создаёт таблицу для логирования всех действий администраторов
-- Дата: 2026-01-09

-- Создать таблицу admin_actions_log
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создать индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action ON admin_actions_log(action);

-- Комментарии для понимания структуры
COMMENT ON TABLE admin_actions_log IS 'Журнал всех действий администраторов (audit trail)';
COMMENT ON COLUMN admin_actions_log.admin_id IS 'ID администратора, выполнившего действие';
COMMENT ON COLUMN admin_actions_log.action IS 'Тип действия: activate_vip, block_user, extend_subscription, revoke_vip и т.д.';
COMMENT ON COLUMN admin_actions_log.target_user_id IS 'ID пользователя, над которым было выполнено действие';
COMMENT ON COLUMN admin_actions_log.metadata IS 'Дополнительные данные о действии (JSON)';
COMMENT ON COLUMN admin_actions_log.ip_address IS 'IP адрес администратора';
COMMENT ON COLUMN admin_actions_log.user_agent IS 'User Agent браузера администратора';

-- RLS: Админы могут видеть только свои логи (superadmin может видеть все)
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;

-- Политика: Админы могут видеть все логи
CREATE POLICY admin_actions_log_select_policy
  ON admin_actions_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Политика: Только система может вставлять логи (через service role)
-- Никто не может вставлять логи через обычный auth
CREATE POLICY admin_actions_log_insert_policy
  ON admin_actions_log
  FOR INSERT
  WITH CHECK (false); -- Запрещаем INSERT через обычный auth

-- Никто не может обновлять или удалять логи (audit trail)
CREATE POLICY admin_actions_log_update_policy
  ON admin_actions_log
  FOR UPDATE
  USING (false);

CREATE POLICY admin_actions_log_delete_policy
  ON admin_actions_log
  FOR DELETE
  USING (false);

-- ========================================
-- Примеры использования
-- ========================================

-- Пример 1: Логирование активации VIP
/*
INSERT INTO admin_actions_log (admin_id, action, target_user_id, metadata)
VALUES (
  'admin-uuid-here',
  'activate_vip',
  'user-uuid-here',
  '{"duration": "1month", "reason": "За помощь в тестировании"}'::jsonb
);
*/

-- Пример 2: Логирование блокировки пользователя
/*
INSERT INTO admin_actions_log (admin_id, action, target_user_id, metadata)
VALUES (
  'admin-uuid-here',
  'block_user',
  'user-uuid-here',
  '{"reason": "Нарушение правил"}'::jsonb
);
*/

-- Пример 3: Просмотр всех действий конкретного админа
/*
SELECT
  aal.created_at,
  aal.action,
  p.email as target_user_email,
  aal.metadata
FROM admin_actions_log aal
LEFT JOIN profiles p ON p.id = aal.target_user_id
WHERE aal.admin_id = 'admin-uuid-here'
ORDER BY aal.created_at DESC
LIMIT 50;
*/

-- Пример 4: Просмотр всех действий за последние 24 часа
/*
SELECT
  a.email as admin_email,
  aal.action,
  p.email as target_user_email,
  aal.created_at,
  aal.metadata
FROM admin_actions_log aal
LEFT JOIN profiles a ON a.id = aal.admin_id
LEFT JOIN profiles p ON p.id = aal.target_user_id
WHERE aal.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY aal.created_at DESC;
*/
