-- ==============================================
-- TEAM SYSTEM TABLES
-- Система команд для ΑΠΑΛΛΑΚΤΗΣ
-- ==============================================

-- 1. TEAMS TABLE
-- Команды (один аккаунт = одна команда)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan VARCHAR(20) DEFAULT 'basic', -- basic, standard, premium, vip
  max_members INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(owner_id) -- Один пользователь = один владелец команды
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);

-- 2. TEAM_MEMBERS TABLE
-- Члены команды
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'owner' или 'member'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),

  UNIQUE(team_id, user_id) -- Пользователь может быть в команде только один раз
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- 3. TEAM_INVITATIONS TABLE
-- Приглашения в команду
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(team_id, email, status) -- Нельзя пригласить одного человека дважды (pending)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- ==============================================
-- RLS POLICIES
-- ==============================================

-- Включаем RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- TEAMS POLICIES
-- Владелец видит свою команду
CREATE POLICY "Owner can view own team" ON teams
  FOR SELECT USING (owner_id = auth.uid());

-- Члены команды видят команду
CREATE POLICY "Members can view team" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Владелец может обновлять свою команду
CREATE POLICY "Owner can update own team" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

-- Пользователь может создать команду (если у него нет)
CREATE POLICY "User can create team" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- TEAM_MEMBERS POLICIES
-- Члены команды видят других членов
CREATE POLICY "Members can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Владелец может добавлять членов
CREATE POLICY "Owner can add members" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- Владелец может удалять членов (кроме себя)
CREATE POLICY "Owner can remove members" ON team_members
  FOR DELETE USING (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    AND user_id != auth.uid()
  );

-- Член может покинуть команду (удалить себя)
CREATE POLICY "Member can leave team" ON team_members
  FOR DELETE USING (
    user_id = auth.uid()
    AND role != 'owner'
  );

-- TEAM_INVITATIONS POLICIES
-- Владелец видит приглашения своей команды
CREATE POLICY "Owner can view invitations" ON team_invitations
  FOR SELECT USING (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- Приглашённый видит своё приглашение по email
CREATE POLICY "Invitee can view own invitation" ON team_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Владелец может создавать приглашения
CREATE POLICY "Owner can create invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- Владелец может отменять приглашения
CREATE POLICY "Owner can cancel invitations" ON team_invitations
  FOR UPDATE USING (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Функция для автоматического создания команды при регистрации
CREATE OR REPLACE FUNCTION create_team_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаём команду для нового пользователя
  INSERT INTO teams (name, owner_id, subscription_plan, max_members)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', 'My Team'),
    NEW.id,
    'demo',
    1
  );

  -- Добавляем владельца как члена команды
  INSERT INTO team_members (team_id, user_id, role)
  SELECT id, NEW.id, 'owner'
  FROM teams WHERE owner_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер при создании пользователя
DROP TRIGGER IF EXISTS on_auth_user_created_team ON auth.users;
CREATE TRIGGER on_auth_user_created_team
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_team_for_new_user();

-- Функция для обновления max_members при смене подписки
CREATE OR REPLACE FUNCTION update_team_max_members()
RETURNS TRIGGER AS $$
DECLARE
  new_max INTEGER;
BEGIN
  -- Определяем лимит по плану
  CASE NEW.subscription_plan
    WHEN 'basic' THEN new_max := 1;
    WHEN 'standard' THEN new_max := 2;
    WHEN 'premium' THEN new_max := 999;
    WHEN 'vip' THEN new_max := 999;
    ELSE new_max := 1;
  END CASE;

  -- Обновляем команду пользователя
  UPDATE teams
  SET max_members = new_max,
      subscription_plan = NEW.subscription_plan,
      updated_at = NOW()
  WHERE owner_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер при обновлении подписки в profiles
DROP TRIGGER IF EXISTS on_subscription_change ON profiles;
CREATE TRIGGER on_subscription_change
  AFTER UPDATE OF subscription_plan ON profiles
  FOR EACH ROW
  WHEN (OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan)
  EXECUTE FUNCTION update_team_max_members();

-- Функция для генерации токена приглашения
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- HELPER VIEWS
-- ==============================================

-- Вью для получения команды пользователя с членами
CREATE OR REPLACE VIEW user_team_view AS
SELECT
  t.id AS team_id,
  t.name AS team_name,
  t.owner_id,
  t.subscription_plan,
  t.max_members,
  t.created_at,
  tm.user_id,
  tm.role,
  tm.joined_at,
  p.name AS member_name,
  p.email AS member_email
FROM teams t
JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN profiles p ON tm.user_id = p.id;

-- ==============================================
-- INITIAL DATA MIGRATION
-- Создание команд для существующих пользователей
-- ==============================================

-- Создаём команды для всех существующих пользователей, у которых их нет
INSERT INTO teams (name, owner_id, subscription_plan, max_members)
SELECT
  COALESCE(p.name, 'My Team'),
  p.id,
  COALESCE(
    CASE
      WHEN p.subscription_status = 'vip' THEN 'vip'
      ELSE LOWER(COALESCE(p.subscription_plan, p.subscription_tier, 'demo'))
    END,
    'demo'
  ),
  CASE
    WHEN p.subscription_status = 'vip' THEN 999
    WHEN LOWER(COALESCE(p.subscription_plan, p.subscription_tier)) = 'premium' THEN 999
    WHEN LOWER(COALESCE(p.subscription_plan, p.subscription_tier)) = 'standard' THEN 2
    ELSE 1
  END
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE owner_id = p.id)
ON CONFLICT (owner_id) DO NOTHING;

-- Добавляем владельцев как членов команды
INSERT INTO team_members (team_id, user_id, role)
SELECT t.id, t.owner_id, 'owner'
FROM teams t
WHERE NOT EXISTS (
  SELECT 1 FROM team_members
  WHERE team_id = t.id AND user_id = t.owner_id
)
ON CONFLICT (team_id, user_id) DO NOTHING;

-- ==============================================
-- COMMENTS
-- ==============================================

COMMENT ON TABLE teams IS 'Команды пользователей. Каждый пользователь - владелец одной команды.';
COMMENT ON TABLE team_members IS 'Члены команды. Включает владельца (role=owner) и приглашённых (role=member).';
COMMENT ON TABLE team_invitations IS 'Приглашения в команду. Истекают через 7 дней.';

COMMENT ON COLUMN teams.max_members IS 'Максимум членов: Basic=1, Standard=2, Premium/VIP=999';
COMMENT ON COLUMN team_invitations.token IS 'Уникальный токен для ссылки приглашения';
COMMENT ON COLUMN team_invitations.status IS 'pending=ожидает, accepted=принято, expired=истекло, cancelled=отменено';
