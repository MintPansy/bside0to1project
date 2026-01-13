-- Team Invites 테이블 추가 (팀원 초대용)
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for team_invites
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites of their teams"
  ON team_invites FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'leader'
    ) OR
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Team leaders can create invites"
  ON team_invites FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (
      team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = auth.uid() AND role = 'leader'
      ) OR
      team_id IN (
        SELECT id FROM teams WHERE created_by = auth.uid()
      )
    )
  );

