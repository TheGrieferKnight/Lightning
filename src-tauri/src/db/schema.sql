-- ---------- App/global ----------
CREATE TABLE IF NOT EXISTS app_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  image_path TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ---------- Summoner-level ----------
CREATE TABLE IF NOT EXISTS summoners (
  puuid TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  level INTEGER NOT NULL,
  profile_icon_id INTEGER NOT NULL,
  profile_icon_path TEXT NOT NULL,
  -- Ranked info (full LeagueEntryDTO)
  rank_league_id TEXT NOT NULL,
  rank_queue_type TEXT NOT NULL,
  rank_tier TEXT NOT NULL,
  rank_division TEXT NOT NULL,
  rank_lp INTEGER NOT NULL,
  rank_wins INTEGER NOT NULL,
  rank_losses INTEGER NOT NULL,
  rank_hot_streak INTEGER NOT NULL CHECK (rank_hot_streak IN (0, 1)),
  rank_veteran INTEGER NOT NULL CHECK (rank_veteran IN (0, 1)),
  rank_fresh_blood INTEGER NOT NULL CHECK (rank_fresh_blood IN (0, 1)),
  rank_inactive INTEGER NOT NULL CHECK (rank_inactive IN (0, 1)),
  rank_mini_series_json TEXT,
  -- store MiniSeriesDTO as JSON
  win_rate INTEGER NOT NULL,
  recent_games INTEGER NOT NULL,
  favorite_role TEXT NOT NULL,
  main_champion TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ---------- Stats ----------
CREATE TABLE IF NOT EXISTS stats (
  puuid TEXT PRIMARY KEY,
  total_games INTEGER NOT NULL,
  avg_game_time TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (puuid) REFERENCES summoners(puuid) ON DELETE CASCADE
);

-- ---------- Champion mastery ----------
CREATE TABLE IF NOT EXISTS champion_mastery (
  puuid TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  points INTEGER NOT NULL,
  icon TEXT NOT NULL,
  rank_order INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (puuid, name),
  FOREIGN KEY (puuid) REFERENCES summoners(puuid) ON DELETE CASCADE
);

-- ---------- Live game ----------
CREATE TABLE IF NOT EXISTS live_game (
  puuid TEXT PRIMARY KEY,
  game_mode TEXT NOT NULL,
  champion TEXT NOT NULL,
  game_time TEXT NOT NULL,
  performance_score REAL NOT NULL,
  progress INTEGER NOT NULL CHECK (
    progress BETWEEN 0
    AND 100
  ),
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (puuid) REFERENCES summoners(puuid) ON DELETE CASCADE
);

-- ---------- Dashboard matches (UI list) ----------
CREATE TABLE IF NOT EXISTS dashboard_matches (
  match_id TEXT PRIMARY KEY,
  game_id INTEGER,
  puuid TEXT NOT NULL,
  champion TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('Victory', 'Defeat')),
  kda TEXT NOT NULL,
  duration TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  cs INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (puuid) REFERENCES summoners(puuid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dashboard_matches_puuid ON dashboard_matches (puuid);

CREATE INDEX IF NOT EXISTS idx_dashboard_matches_time ON dashboard_matches (timestamp);

-- ---------- Raw + normalized match cache ----------
CREATE TABLE IF NOT EXISTS match_raw (
  match_id TEXT PRIMARY KEY,
  region TEXT,
  payload_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  match_id TEXT PRIMARY KEY,
  data_version TEXT,
  platform_id TEXT,
  game_id INTEGER,
  game_mode TEXT,
  game_name TEXT,
  game_type TEXT,
  game_version TEXT,
  map_id INTEGER,
  queue_id INTEGER,
  game_creation INTEGER,
  game_start_timestamp INTEGER,
  game_end_timestamp INTEGER,
  game_duration INTEGER,
  tournament_code TEXT,
  end_of_game_result TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS match_metadata_participants (
  match_id TEXT NOT NULL,
  puuid TEXT NOT NULL,
  PRIMARY KEY (match_id, puuid),
  FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mmp_puuid ON match_metadata_participants (puuid);

CREATE TABLE IF NOT EXISTS match_teams (
  match_id TEXT NOT NULL,
  team_id INTEGER NOT NULL,
  win INTEGER,
  PRIMARY KEY (match_id, team_id),
  FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS match_team_bans (
  match_id TEXT NOT NULL,
  team_id INTEGER NOT NULL,
  pick_turn INTEGER NOT NULL,
  champion_id INTEGER,
  PRIMARY KEY (match_id, team_id, pick_turn),
  FOREIGN KEY (match_id, team_id) REFERENCES match_teams (match_id, team_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS match_team_objectives (
  match_id TEXT NOT NULL,
  team_id INTEGER NOT NULL,
  objective TEXT NOT NULL,
  first INTEGER,
  kills INTEGER,
  PRIMARY KEY (match_id, team_id, objective),
  FOREIGN KEY (match_id, team_id) REFERENCES match_teams (match_id, team_id) ON DELETE CASCADE,
  CHECK (
    objective IN (
      'baron',
      'champion',
      'dragon',
      'horde',
      'inhibitor',
      'rift_herald',
      'tower'
    )
  )
);

CREATE TABLE IF NOT EXISTS match_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id TEXT NOT NULL,
  participant_id INTEGER,
  puuid TEXT,
  summoner_name TEXT,
  summoner_id TEXT,
  summoner_level INTEGER,
  riot_id_game_name TEXT,
  riot_id_tagline TEXT,
  team_id INTEGER,
  team_position TEXT,
  role TEXT,
  lane TEXT,
  champion_id INTEGER,
  champion_name TEXT,
  champion_transform INTEGER,
  profile_icon INTEGER,
  kills INTEGER,
  deaths INTEGER,
  assists INTEGER,
  double_kills INTEGER,
  triple_kills INTEGER,
  quadra_kills INTEGER,
  penta_kills INTEGER,
  killing_sprees INTEGER,
  largest_killing_spree INTEGER,
  largest_multi_kill INTEGER,
  largest_critical_strike INTEGER,
  unreal_kills INTEGER,
  gold_earned INTEGER,
  gold_spent INTEGER,
  time_played INTEGER,
  time_ccing_others INTEGER,
  total_time_spent_dead INTEGER,
  longest_time_spent_living INTEGER,
  cs_total_minions_killed INTEGER,
  cs_neutral_minions_killed INTEGER,
  total_ally_jungle_minions_killed INTEGER,
  total_enemy_jungle_minions_killed INTEGER,
  damage_dealt_to_buildings INTEGER,
  damage_dealt_to_objectives INTEGER,
  damage_dealt_to_turrets INTEGER,
  damage_self_mitigated INTEGER,
  total_damage_dealt INTEGER,
  total_damage_dealt_to_champions INTEGER,
  magic_damage_dealt INTEGER,
  magic_damage_dealt_to_champions INTEGER,
  magic_damage_taken INTEGER,
  physical_damage_dealt INTEGER,
  physical_damage_dealt_to_champions REAL,
  physical_damage_taken INTEGER,
  true_damage_dealt INTEGER,
  true_damage_dealt_to_champions INTEGER,
  true_damage_taken INTEGER,
  total_damage_taken INTEGER,
  total_damage_shielded_on_teammates INTEGER,
  total_heal INTEGER,
  total_heals_on_teammates INTEGER,
  total_units_healed INTEGER,
  inhibitor_kills INTEGER,
  inhibitor_takedowns INTEGER,
  inhibitors_lost INTEGER,
  turret_kills INTEGER,
  turret_takedowns INTEGER,
  turrets_lost INTEGER,
  items_purchased INTEGER,
  item0 INTEGER,
  item1 INTEGER,
  item2 INTEGER,
  item3 INTEGER,
  item4 INTEGER,
  item5 INTEGER,
  item6 INTEGER,
  spell1_casts INTEGER,
  spell2_casts INTEGER,
  spell3_casts INTEGER,
  spell4_casts INTEGER,
  summoner1_casts INTEGER,
  summoner1_id INTEGER,
  summoner2_casts INTEGER,
  summoner2_id INTEGER,
  team_early_surrendered INTEGER,
  game_ended_in_early_surrender INTEGER,
  game_ended_in_surrender INTEGER,
  eligible_for_progression INTEGER,
  individual_position TEXT,
  participant_index INTEGER,
  vision_score INTEGER,
  vision_wards_bought_in_game INTEGER,
  sight_wards_bought_in_game INTEGER,
  wards_killed INTEGER,
  wards_placed INTEGER,
  all_in_pings INTEGER,
  assist_me_pings INTEGER,
  command_pings INTEGER,
  enemy_missing_pings INTEGER,
  enemy_vision_pings INTEGER,
  get_back_pings INTEGER,
  hold_pings INTEGER,
  need_vision_pings INTEGER,
  on_my_way_pings INTEGER,
  push_pings INTEGER,
  vision_cleared_pings INTEGER,
  placement INTEGER,
  subteam_placement INTEGER,
  player_subteam_id INTEGER,
  player_augment1 INTEGER,
  player_augment2 INTEGER,
  player_augment3 INTEGER,
  player_augment4 INTEGER,
  missions_json TEXT,
  perks_json TEXT,
  challenges_json TEXT,
  win INTEGER,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mp_match_participant ON match_participants (match_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_mp_match_puuid ON match_participants (match_id, puuid);

CREATE INDEX IF NOT EXISTS idx_mp_team ON match_participants (match_id, team_id);

CREATE TABLE IF NOT EXISTS dashboard_cache (
  puuid TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
