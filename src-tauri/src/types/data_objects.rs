use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MatchDto {
    pub metadata: MetadataDto,
    pub info: InfoDto,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MetadataDto {
    pub data_version: Option<String>,
    pub match_id: String,
    pub participants: Vec<String>, // A list of participant PUUIDs
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MiniSeriesDTO {
    pub losses: i32,
    pub progress: String,
    pub target: i32,
    pub wins: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LeagueEntryDTO {
    pub league_id: String,
    pub puuid: String,
    pub queue_type: String,
    pub tier: String,
    pub rank: String,
    pub league_points: i32,
    pub wins: u32,
    pub losses: u32,
    pub hot_streak: bool,
    pub veteran: bool,
    pub fresh_blood: bool,
    pub inactive: bool,
    pub mini_series: Option<MiniSeriesDTO>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InfoDto {
    /// Indicates if the game ended in termination.
    pub end_of_game_result: Option<String>,
    /// Unix timestamp for when the game is created on the game server.
    pub game_creation: Option<i64>,
    /// Game duration (see Riot's note about milliseconds vs seconds).
    pub game_duration: Option<i64>,
    /// Unix timestamp for when match ends on the game server.
    pub game_end_timestamp: Option<i64>,
    pub game_id: Option<i64>,
    /// Game mode (see Riot's Game Constants).
    pub game_mode: Option<String>,
    pub game_name: Option<String>,
    /// Unix timestamp for when match starts on the game server.
    pub game_start_timestamp: Option<i64>,
    pub game_type: Option<String>,
    /// The first two parts can be used to determine the patch a game was played on.
    pub game_version: Option<String>,
    /// Map ID (see Riot's Game Constants).
    pub map_id: Option<u32>,
    pub participants: Option<Vec<ParticipantDto>>,
    /// Platform where the match was played.
    pub platform_id: Option<String>,
    /// Queue ID (see Riot's Game Constants).
    pub queue_id: Option<u32>,
    pub teams: Option<Vec<TeamDto>>,
    /// Tournament code used to generate the match.
    pub tournament_code: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PerksDto {
    pub stat_perks: Option<PerkStatsDto>,
    pub styles: Option<Vec<PerkStyleDto>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PerkStatsDto {
    pub defense: Option<u32>,
    pub flex: Option<u32>,
    pub offense: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PerkStyleDto {
    pub description: Option<String>,
    pub selections: Option<Vec<PerkStyleSelectionDto>>,
    pub style: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TeamDto {
    pub bans: Option<Vec<BanDto>>,
    pub objectives: Option<ObjectivesDto>,
    pub team_id: Option<u32>,
    pub win: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BanDto {
    pub champion_id: Option<i16>,
    pub pick_turn: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ObjectivesDto {
    pub baron: Option<ObjectiveDto>,
    pub champion: Option<ObjectiveDto>,
    pub dragon: Option<ObjectiveDto>,
    pub horde: Option<ObjectiveDto>,
    pub inhibitor: Option<ObjectiveDto>,
    pub rift_herald: Option<ObjectiveDto>,
    pub tower: Option<ObjectiveDto>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ObjectiveDto {
    pub first: Option<bool>,
    pub kills: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PerkStyleSelectionDto {
    pub perk: Option<u32>,
    pub var1: Option<u32>,
    pub var2: Option<u32>,
    pub var3: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MissionsDto {
    pub player_score0: Option<u32>,
    pub player_score1: Option<u32>,
    pub player_score2: Option<u32>,
    pub player_score3: Option<u32>,
    pub player_score4: Option<u32>,
    pub player_score5: Option<u32>,
    pub player_score6: Option<u32>,
    pub player_score7: Option<u32>,
    pub player_score8: Option<u32>,
    pub player_score9: Option<u32>,
    pub player_score10: Option<u32>,
    pub player_score11: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ParticipantDto {
    /// Yellow crossed swords
    pub all_in_pings: Option<u32>,
    /// Green flag
    pub assist_me_pings: Option<u32>,
    pub assists: Option<u32>,
    pub baron_kills: Option<u32>,
    pub bounty_level: Option<u32>,
    pub champ_experience: Option<u32>,
    pub champ_level: Option<u32>,
    /// Prior to patch 11.4, on Feb 18th, 2021, this field returned invalid championIds.
    /// We recommend determining the champion based on the championName field for matches played prior to patch 11.4.
    pub champion_id: Option<u32>,
    pub champion_name: Option<String>,
    /// Blue generic ping (ALT+click)
    pub command_pings: Option<u32>,
    /// This field is currently only utilized for Kayn's transformations.
    /// (Legal values: 0 - None, 1 - Slayer, 2 - Assassin)
    pub champion_transform: Option<u32>,
    pub consumables_purchased: Option<u32>,
    pub challenges: Option<ChallengesDto>,
    pub damage_dealt_to_buildings: Option<u32>,
    pub damage_dealt_to_objectives: Option<u32>,
    pub damage_dealt_to_turrets: Option<u32>,
    pub damage_self_mitigated: Option<u32>,
    pub deaths: Option<u32>,
    pub detector_wards_placed: Option<u32>,
    pub double_kills: Option<u32>,
    pub dragon_kills: Option<u32>,
    pub eligible_for_progression: Option<bool>,
    /// Yellow question mark
    pub enemy_missing_pings: Option<u32>,
    /// Red eyeball
    pub enemy_vision_pings: Option<u32>,
    pub first_blood_assist: Option<bool>,
    pub first_blood_kill: Option<bool>,
    pub first_tower_assist: Option<bool>,
    pub first_tower_kill: Option<bool>,
    pub game_ended_in_early_surrender: Option<bool>,
    pub game_ended_in_surrender: Option<bool>,
    pub hold_pings: Option<u32>,
    /// Yellow circle with horizontal line
    pub get_back_pings: Option<u32>,
    pub gold_earned: Option<u32>,
    pub gold_spent: Option<u32>,
    /// See Riot's note on position fields
    pub individual_position: Option<String>,
    pub inhibitor_kills: Option<u32>,
    pub inhibitor_takedowns: Option<u32>,
    pub inhibitors_lost: Option<u32>,
    pub item0: Option<u32>,
    pub item1: Option<u32>,
    pub item2: Option<u32>,
    pub item3: Option<u32>,
    pub item4: Option<u32>,
    pub item5: Option<u32>,
    pub item6: Option<u32>,
    pub items_purchased: Option<u32>,
    pub killing_sprees: Option<u32>,
    pub kills: Option<u32>,
    pub lane: Option<String>,
    pub largest_critical_strike: Option<u32>,
    pub largest_killing_spree: Option<u32>,
    pub largest_multi_kill: Option<u32>,
    pub longest_time_spent_living: Option<u32>,
    pub magic_damage_dealt: Option<u32>,
    pub magic_damage_dealt_to_champions: Option<u32>,
    pub magic_damage_taken: Option<u32>,
    pub missions: Option<MissionsDto>,
    /// neutralMinionsKilled = mNeutralMinionsKilled, incremented on kills of kPet and kJungleMonster
    pub neutral_minions_killed: Option<u32>,
    /// Green ward
    pub need_vision_pings: Option<u32>,
    pub nexus_kills: Option<u32>,
    pub nexus_takedowns: Option<u32>,
    pub nexus_lost: Option<u32>,
    pub objectives_stolen: Option<u32>,
    pub objectives_stolen_assists: Option<u32>,
    /// Blue arrow pointing at ground
    pub on_my_way_pings: Option<u32>,
    pub participant_id: Option<u32>,
    pub player_score0: Option<u32>,
    pub player_score1: Option<u32>,
    pub player_score2: Option<u32>,
    pub player_score3: Option<u32>,
    pub player_score4: Option<u32>,
    pub player_score5: Option<u32>,
    pub player_score6: Option<u32>,
    pub player_score7: Option<u32>,
    pub player_score8: Option<u32>,
    pub player_score9: Option<u32>,
    pub player_score10: Option<u32>,
    pub player_score11: Option<u32>,
    pub penta_kills: Option<u32>,
    pub perks: Option<PerksDto>,
    pub physical_damage_dealt: Option<u32>,
    pub physical_damage_dealt_to_champions: Option<f32>,
    pub physical_damage_taken: Option<u32>,
    pub placement: Option<u32>,
    pub player_augment1: Option<u32>,
    pub player_augment2: Option<u32>,
    pub player_augment3: Option<u32>,
    pub player_augment4: Option<u32>,
    pub player_subteam_id: Option<u32>,
    /// Green minion
    pub push_pings: Option<u32>,
    pub profile_icon: Option<u32>,
    pub puuid: Option<String>,
    pub quadra_kills: Option<u32>,
    pub riot_id_game_name: Option<String>,
    pub riot_id_tagline: Option<String>,
    pub role: Option<String>,
    pub sight_wards_bought_in_game: Option<u32>,
    pub spell1_casts: Option<u32>,
    pub spell2_casts: Option<u32>,
    pub spell3_casts: Option<u32>,
    pub spell4_casts: Option<u32>,
    pub subteam_placement: Option<u32>,
    pub summoner1_casts: Option<u32>,
    pub summoner1_id: Option<u32>,
    pub summoner2_casts: Option<u32>,
    pub summoner2_id: Option<u32>,
    pub summoner_id: Option<String>,
    pub summoner_level: Option<u32>,
    pub summoner_name: Option<String>,
    pub team_early_surrendered: Option<bool>,
    pub team_id: Option<u32>,
    /// See Riot's note on position fields
    pub team_position: Option<String>,
    pub time_ccing_others: Option<u32>,
    pub time_played: Option<u32>,
    pub total_ally_jungle_minions_killed: Option<u32>,
    pub total_damage_dealt: Option<u32>,
    pub total_damage_dealt_to_champions: Option<u32>,
    pub total_damage_shielded_on_teammates: Option<u32>,
    pub total_damage_taken: Option<u32>,
    pub total_enemy_jungle_minions_killed: Option<u32>,
    /// Includes healing enemies, jungle monsters, yourself, etc.
    pub total_heal: Option<u32>,
    /// Post-modified healing on teammates
    pub total_heals_on_teammates: Option<u32>,
    /// totalMillionsKilled = mMinionsKilled, incremented on kills of lane minions
    pub total_minions_killed: Option<u32>,
    pub total_time_cc_dealt: Option<u32>,
    pub total_time_spent_dead: Option<u32>,
    pub total_units_healed: Option<u32>,
    pub triple_kills: Option<u32>,
    pub true_damage_dealt: Option<u32>,
    pub true_damage_dealt_to_champions: Option<u32>,
    pub true_damage_taken: Option<u32>,
    pub turret_kills: Option<u32>,
    pub turret_takedowns: Option<u32>,
    pub turrets_lost: Option<u32>,
    pub unreal_kills: Option<u32>,
    pub vision_score: Option<u32>,
    pub vision_cleared_pings: Option<u32>,
    pub vision_wards_bought_in_game: Option<u32>,
    pub wards_killed: Option<u32>,
    pub wards_placed: Option<u32>,
    pub win: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChallengesDto {
    pub _12_assist_streak_count: Option<u32>,
    pub baron_buff_gold_advantage_over_threshold: Option<u32>,
    pub control_ward_time_coverage_in_river_or_enemy_half: Option<f32>,
    pub earliest_baron: Option<f32>,
    pub earliest_dragon_takedown: Option<f32>,
    pub earliest_elder_dragon: Option<f32>,
    pub early_laning_phase_gold_exp_advantage: Option<u32>,
    pub faster_support_quest_completion: Option<u32>,
    pub fastest_legendary: Option<f32>,
    pub had_afk_teammate: Option<u32>,
    pub highest_champion_damage: Option<u32>,
    pub highest_crowd_control_score: Option<u32>,
    pub highest_ward_kills: Option<u32>,
    pub jungler_kills_early_jungle: Option<u32>,
    pub kills_on_laners_early_jungle_as_jungler: Option<u32>,
    pub laning_phase_gold_exp_advantage: Option<u32>,
    pub legendary_count: Option<u32>,
    pub max_cs_advantage_on_lane_opponent: Option<f32>,
    pub max_level_lead_lane_opponent: Option<u32>,
    pub most_wards_destroyed_one_sweeper: Option<u32>,
    pub mythic_item_used: Option<u32>,
    pub played_champ_select_position: Option<u32>,
    pub solo_turrets_lategame: Option<u32>,
    pub takedowns_first25_minutes: Option<u32>,
    pub teleport_takedowns: Option<u32>,
    pub third_inhibitor_destroyed_time: Option<u32>,
    pub three_wards_one_sweeper_count: Option<u32>,
    pub vision_score_advantage_lane_opponent: Option<f32>,
    pub infernal_scale_pickup: Option<u32>,
    pub fist_bump_participation: Option<u32>,
    pub void_monster_kill: Option<u32>,
    pub ability_uses: Option<u32>,
    pub aces_before15_minutes: Option<u32>,
    pub allied_jungle_monster_kills: Option<f32>,
    pub baron_takedowns: Option<u32>,
    pub blast_cone_opposite_opponent_count: Option<u32>,
    pub bounty_gold: Option<f32>,
    pub buffs_stolen: Option<u32>,
    pub complete_support_quest_in_time: Option<u32>,
    pub control_wards_placed: Option<u32>,
    pub damage_per_minute: Option<f32>,
    pub damage_taken_on_team_percentage: Option<f32>,
    pub danced_with_rift_herald: Option<u32>,
    pub deaths_by_enemy_champs: Option<u32>,
    pub dodge_skill_shots_small_window: Option<u32>,
    pub double_aces: Option<u32>,
    pub dragon_takedowns: Option<u32>,
    pub legendary_item_used: Option<Vec<u32>>,
    pub effective_heal_and_shielding: Option<f32>,
    pub elder_dragon_kills_with_opposing_soul: Option<u32>,
    pub elder_dragon_multikills: Option<u32>,
    pub enemy_champion_immobilizations: Option<u32>,
    pub enemy_jungle_monster_kills: Option<f32>,
    pub epic_monster_kills_near_enemy_jungler: Option<u32>,
    pub epic_monster_kills_within30_seconds_of_spawn: Option<u32>,
    pub epic_monster_steals: Option<u32>,
    pub epic_monster_stolen_without_smite: Option<u32>,
    pub first_turret_killed: Option<u32>,
    pub first_turret_killed_time: Option<f32>,
    pub flawless_aces: Option<u32>,
    pub full_team_takedown: Option<u32>,
    pub game_length: Option<f32>,
    pub get_takedowns_in_all_lanes_early_jungle_as_laner: Option<u32>,
    pub gold_per_minute: Option<f32>,
    pub had_open_nexus: Option<u32>,
    pub immobilize_and_kill_with_ally: Option<u32>,
    pub initial_buff_count: Option<u32>,
    pub initial_crab_count: Option<u32>,
    pub jungle_cs_before10_minutes: Option<f32>,
    pub jungler_takedowns_near_damaged_epic_monster: Option<u32>,
    pub kda: Option<f32>,
    pub kill_after_hidden_with_ally: Option<u32>,
    pub killed_champ_took_full_team_damage_survived: Option<u32>,
    pub killing_sprees: Option<u32>,
    pub kill_participation: Option<f32>,
    pub kills_near_enemy_turret: Option<u32>,
    pub kills_on_other_lanes_early_jungle_as_laner: Option<u32>,
    pub kills_on_recently_healed_by_aram_pack: Option<u32>,
    pub kills_under_own_turret: Option<u32>,
    pub kills_with_help_from_epic_monster: Option<u32>,
    pub knock_enemy_into_team_and_kill: Option<u32>,
    pub k_turrets_destroyed_before_plates_fall: Option<u32>,
    pub land_skill_shots_early_game: Option<u32>,
    pub lane_minions_first10_minutes: Option<u32>,
    pub lost_an_inhibitor: Option<u32>,
    pub max_kill_deficit: Option<u32>,
    pub mejais_full_stack_in_time: Option<u32>,
    pub more_enemy_jungle_than_opponent: Option<f32>,
    /// This is an offshoot of the OneStone challenge.
    pub multi_kill_one_spell: Option<u32>,
    pub multikills: Option<u32>,
    pub multikills_after_aggressive_flash: Option<u32>,
    pub multi_turret_rift_herald_count: Option<u32>,
    pub outer_turret_executes_before10_minutes: Option<u32>,
    pub outnumbered_kills: Option<u32>,
    pub outnumbered_nexus_kill: Option<u32>,
    pub perfect_dragon_souls_taken: Option<u32>,
    pub perfect_game: Option<u32>,
    pub pick_kill_with_ally: Option<u32>,
    pub poro_explosions: Option<u32>,
    pub quick_cleanse: Option<u32>,
    pub quick_first_turret: Option<u32>,
    pub quick_solo_kills: Option<u32>,
    pub rift_herald_takedowns: Option<u32>,
    pub save_ally_from_death: Option<u32>,
    pub scuttle_crab_kills: Option<u32>,
    pub shortest_time_to_ace_from_first_takedown: Option<f32>,
    pub skillshots_dodged: Option<u32>,
    pub skillshots_hit: Option<u32>,
    pub snowballs_hit: Option<u32>,
    pub solo_baron_kills: Option<u32>,
    pub swarm_defeat_aatrox: Option<u32>,
    pub swarm_defeat_briar: Option<u32>,
    pub swarm_defeat_mini_bosses: Option<u32>,
    pub swarm_evolve_weapon: Option<u32>,
    pub swarm_have3_passives: Option<u32>,
    pub swarm_kill_enemy: Option<u32>,
    pub swarm_pickup_gold: Option<f32>,
    pub swarm_reach_level50: Option<u32>,
    pub swarm_survive15_min: Option<u32>,
    pub swarm_win_with5_evolved_weapons: Option<u32>,
    pub solo_kills: Option<u32>,
    pub stealth_wards_placed: Option<u32>,
    pub survived_single_digit_hp_count: Option<u32>,
    pub survived_three_immobilizes_in_fight: Option<u32>,
    pub takedown_on_first_turret: Option<u32>,
    pub takedowns: Option<u32>,
    pub takedowns_after_gaining_level_advantage: Option<u32>,
    pub takedowns_before_jungle_minion_spawn: Option<u32>,
    pub takedowns_first_x_minutes: Option<u32>,
    pub takedowns_in_alcove: Option<u32>,
    pub takedowns_in_enemy_fountain: Option<u32>,
    pub team_baron_kills: Option<u32>,
    pub team_damage_percentage: Option<f32>,
    pub team_elder_dragon_kills: Option<u32>,
    pub team_rift_herald_kills: Option<u32>,
    pub took_large_damage_survived: Option<u32>,
    pub turret_plates_taken: Option<u32>,
    /// Credit for damaging a tower destroyed within 30s of Rift Herald charge
    pub turrets_taken_with_rift_herald: Option<u32>,
    pub turret_takedowns: Option<u32>,
    pub twenty_minions_in3_seconds_count: Option<u32>,
    pub two_wards_one_sweeper_count: Option<u32>,
    pub unseen_recalls: Option<u32>,
    pub vision_score_per_minute: Option<f32>,
    pub wards_guarded: Option<u32>,
    pub ward_takedowns: Option<u32>,
    pub ward_takedowns_before20_m: Option<u32>,
}
