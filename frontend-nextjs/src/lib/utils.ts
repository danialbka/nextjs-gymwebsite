import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock functions for frontend-only build
export async function verifyPassword(_password: string, _hash: string): Promise<boolean> {
  console.warn('verifyPassword called in frontend-only mode');
  return false;
}

export async function hashPassword(_password: string): Promise<string> {
  console.warn('hashPassword called in frontend-only mode');
  return 'mock-hash';
}

export function generateToken(_payload: unknown): string {
  console.warn('generateToken called in frontend-only mode');
  return 'mock-token';
}

export function createApiResponse(data?: unknown, error?: string, message?: string) {
  return {
    success: !error,
    data: data || null,
    error: error || null,
    message: message || null
  };
}

export function calculateDotsScore(bodyweight: number, total: number, gender: string): number {
  console.warn('calculateDotsScore called in frontend-only mode');
  // Simple mock calculation
  const coefficient = gender === 'male' ? 500 : 300;
  return Math.round((total / bodyweight) * coefficient);
}

export function calculateElo(playerRating: number, opponentRating: number, result: number): number {
  console.warn('calculateElo called in frontend-only mode');
  // Simple mock ELO calculation
  const k = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(playerRating + k * (result - expectedScore));
}

export function validateVideoFile(file: File): { valid: boolean; message?: string } {
  console.warn('validateVideoFile called in frontend-only mode');
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Invalid file type. Please upload MP4, MOV, or AVI files.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: 'File too large. Maximum size is 50MB.' };
  }
  
  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username || username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getInstagramEmbedUrl(url: string): string {
  // Convert Instagram URL to embed format
  // From: https://www.instagram.com/p/POST_ID/
  // To: https://www.instagram.com/p/POST_ID/embed/
  
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length >= 2 && (pathSegments[0] === 'p' || pathSegments[0] === 'reel' || pathSegments[0] === 'tv')) {
      return `https://www.instagram.com/${pathSegments[0]}/${pathSegments[1]}/embed/`;
    }
    
    return url; // Return original if can't parse
  } catch {
    return url; // Return original if invalid URL
  }
}