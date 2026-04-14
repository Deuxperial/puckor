-- Créer la table lineups
CREATE TABLE lineups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS pour lineups
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

-- Politiques pour lineups (via team ownership)
CREATE POLICY "Users can view lineups from their teams" ON lineups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = lineups.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lineups to their teams" ON lineups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = lineups.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lineups from their teams" ON lineups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = lineups.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lineups from their teams" ON lineups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = lineups.team_id
      AND teams.user_id = auth.uid()
    )
  );

-- Index pour optimiser les requêtes
CREATE INDEX lineups_team_id_idx ON lineups(team_id);
CREATE INDEX lineups_created_at_idx ON lineups(created_at DESC);
