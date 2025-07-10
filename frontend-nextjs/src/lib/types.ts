// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// User Types
export interface User {
  id: number;
  username: string;
  display_name?: string;
  team?: string;
  weight?: number;
  gender?: 'male' | 'female';
  flag: string;
  elo: number;
  created_at: string;
}

export interface UserWithLifts extends User {
  bench?: number;
  squat?: number;
  deadlift?: number;
  dots_score: number;
  total_lifted: number;
}

// Video/Post Types
export interface Video {
  id: number;
  username: string;
  lift_type: 'bench' | 'deadlift' | 'squat';
  weight: number;
  video_url: string;
  flag: string;
  team?: string;
  elo: number;
  dots_score?: number;
  created_at: string;
}

export interface Post {
  id: number;
  username: string;
  lift_type: 'bench' | 'deadlift' | 'squat';
  weight: number;
  video_url?: string;
  created_at: string;
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

export interface LeaderboardEntry {
  username: string;
  display_name?: string;
  flag: string;
  team?: string;
  elo: number;
  bench?: number;
  squat?: number;
  deadlift?: number;
  dots_score?: number;
  total_lifted: number;
}

// Form Data Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  team: string;
  weight: number;
  gender: 'male' | 'female';
  flag: string;
}

// API Request Types
export interface LoginRequest {
  username: string;
  password: string;
}

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
  created_at: string;
}

export interface ProfileUpdateForm {
  username: string;
  new_username: string;
  team: string;
  weight?: number;
  gender: 'male' | 'female';
}

export interface PRSubmissionForm {
  username: string;
  lift_type: 'bench' | 'deadlift' | 'squat';
  weight: number;
  video: File | null;
}

export interface PRSubmissionRequest {
  username: string;
  lift_type: 'bench' | 'deadlift' | 'squat';
  weight: number;
  video_url: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
} 