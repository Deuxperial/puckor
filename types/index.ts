export type TeamMember = {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  isActive: boolean;
};

export type Team = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  name: string;
  number: number;
  position: string;
  handedness: 'left' | 'right' | 'both';
  team_id: string;
  created_at: string;
  updated_at: string;
};

// Types pour les lineups
// Une ligne classique / PP = 2 défenseurs + 3 attaquants
// Une ligne BP = 2 défenseurs + 2 attaquants
// Le gardien principal est géré séparément
export type LinePosition = 'goalie' | 'def_left' | 'def_right' | 'att_left' | 'att_center' | 'att_right';
export type LineKind = 'line' | 'powerplay' | 'boxplay';

export type LinePlayer = {
  id: string;
  name: string;
  number: number;
  position: string; // Gardien, Défenseur, Ailier, Centre
  linePosition: LinePosition; // Position fixe sur la ligne
};

export type HockeyLine = {
  id?: string;
  label?: string;
  shortLabel?: string;
  kind?: LineKind;
  players: LinePlayer[];
  notes?: string;
};

export type LineupData = {
  lines: HockeyLine[];
  mainGoalie?: LinePlayer;
};

export type Lineup = {
  id: string;
  name: string;
  team_id: string;
  data: LineupData;
  created_at: string;
  updated_at: string;
};
