// User Types
export interface User {
  id: number;
  username: string;
  email?: string;
  display_name?: string;
  password_hash: string;
  flag: string;
  team?: string;
  weight?: number;
  gender?: 'male' | 'female';
  elo: number;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
}

export interface UserResponse {
  id: number;
  username: string;
  email?: string;
  display_name?: string;
  flag: string;
  team?: string;
  weight?: number;
  gender?: 'male' | 'female';
  elo: number;
  created_at: Date;
}

// PR Types
export interface PR {
  id: number;
  username: string;
  lift_type: 'bench' | 'squat' | 'deadlift';
  weight: number;
  video_url?: string;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Request Types
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  display_name?: string;
  flag: string;
  team?: string;
  weight?: number;
  gender: 'male' | 'female';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface PRSubmissionRequest {
  username: string;
  lift_type: 'bench' | 'squat' | 'deadlift';
  weight: number;
  video_url?: string;
}

export interface ProfileUpdateRequest {
  username: string;
  new_username?: string;
  email?: string;
  display_name?: string;
  team?: string;
  weight?: number;
  gender?: 'male' | 'female';
}

// Leaderboard Types
export interface LeaderboardEntry {
  username: string;
  display_name?: string;
  flag: string;
  team?: string;
  weight?: number;
  gender?: 'male' | 'female';
  elo: number;
  bench?: number;
  squat?: number;
  deadlift?: number;
  total_lifted: number;
  dots_score: number;
}

// Team Types
export interface Team {
  team: string;
  member_count: number;
  avg_elo: number;
  top_elo: number;
}

export interface TeamMember {
  username: string;
  display_name?: string;
  flag: string;
  elo: number;
}

// DOTS Calculation Types
export interface DOTSConstants {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
} 