import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DOTSConstants } from './types';

// Logging utility
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

// JWT utilities
export function generateToken(payload: any): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.verify(token, secret);
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// DOTS Formula Constants
const DOTS_MEN: DOTSConstants = {
  a: 47.46178854,
  b: 8.472061379,
  c: 0.07369410346,
  d: -0.001395833811,
  e: 0.000007076659730
};

const DOTS_WOMEN: DOTSConstants = {
  a: -125.4255398,
  b: 13.71219419,
  c: -0.03307250631,
  d: 0.0003872554572,
  e: -0.00000113708316
};

export function calculateDotsScore(
  totalLifted: number,
  bodyweight: number,
  gender: 'male' | 'female'
): number {
  if (!bodyweight || bodyweight <= 0) {
    return 0;
  }

  const constants = gender === 'male' ? DOTS_MEN : DOTS_WOMEN;

  // DOTS formula: 500 * total_lifted / (a + b*W + c*W^2 + d*W^3 + e*W^4)
  const denominator = (
    constants.a +
    constants.b * bodyweight +
    constants.c * (bodyweight ** 2) +
    constants.d * (bodyweight ** 3) +
    constants.e * (bodyweight ** 4)
  );

  const dotsScore = 500 * totalLifted / denominator;
  return Math.round(dotsScore * 100) / 100; // Round to 2 decimal places
}

export function calculateElo(totalWeight: number): number {
  // Simplified ELO formula (can be made more sophisticated)
  return Math.round(1000 + totalWeight * 1.5);
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  if (username.length > 30) {
    return { valid: false, message: 'Username must be less than 30 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  return { valid: true };
}

// Video link utilities
export function validateVideoUrl(url: string): { valid: boolean; message?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, message: 'Video URL is required' };
  }

  // Remove whitespace
  url = url.trim();

  try {
    const urlObj = new URL(url);
    
    // Check for supported platforms
    const hostname = urlObj.hostname.toLowerCase();
    
    // Instagram support
    if (hostname.includes('instagram.com')) {
      // Instagram post or reel URL patterns
      const instagramPatterns = [
        /^https:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?/,
        /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/,
        /^https:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+\/?/
      ];
      
      if (instagramPatterns.some(pattern => pattern.test(url))) {
        return { valid: true };
      }
    }
    
    // YouTube support
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return { valid: true };
    }
    
    // TikTok support
    if (hostname.includes('tiktok.com')) {
      return { valid: true };
    }
    
    // Twitter/X support
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return { valid: true };
    }
    
    // Generic video file URLs
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    if (videoExtensions.some(ext => url.toLowerCase().includes(ext))) {
      return { valid: true };
    }
    
    return { valid: false, message: 'Unsupported video platform. Please use Instagram, YouTube, TikTok, Twitter/X, or direct video links.' };
    
  } catch (error) {
    return { valid: false, message: 'Invalid URL format' };
  }
}

export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Instagram
    if (hostname.includes('instagram.com')) {
      const match = url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      return match ? match[1] : null;
    }
    
    // YouTube
    if (hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    if (hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    
    return null;
  } catch {
    return null;
  }
}

// Rate limiting utility
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  if (rateLimitStore.has(key)) {
    const entry = rateLimitStore.get(key)!;
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Check if request is allowed
  const entry = rateLimitStore.get(key);
  if (!entry) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, resetTime: entry.resetTime };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { allowed: true };
}

export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

// Auth middleware utility
export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  return token;
}

export function verifyAuthToken(request: Request): { success: boolean; user?: any; error?: string } {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return { success: false, error: 'No token provided' };
    }
    
    const decoded = verifyToken(token);
    return { success: true, user: decoded };
  } catch (error: any) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

// Response utilities
export function createApiResponse<T>(
  data?: T,
  error?: string,
  message?: string
): { success: boolean; data?: T; error?: string; message?: string } {
  return {
    success: !error,
    data,
    error,
    message
  };
} 