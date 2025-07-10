import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyPassword, generateToken, createApiResponse, checkRateLimit, getRateLimitIdentifier, logger } from '@/lib/utils';
import { LoginRequest, UserResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting (5 attempts per 15 minutes)
    const rateLimitId = getRateLimitIdentifier(request);
    const rateLimitResult = checkRateLimit(rateLimitId, 5, 15 * 60 * 1000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createApiResponse(undefined, 'Too many login attempts. Please try again later.'),
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      logger.warn('Login attempt with missing credentials');
      return NextResponse.json(
        createApiResponse(undefined, 'Username and password are required'),
        { status: 400 }
      );
    }

    logger.debug('Processing login request', { username });
    
    try {
      // Get user from database
      const userResult = await query(
        `SELECT id, username, password_hash, email, display_name, flag, team, weight, gender, elo, is_active, created_at 
         FROM users WHERE username = $1 AND is_active = TRUE`,
        [username]
      );

      if (userResult.rows.length === 0) {
        logger.warn('Login attempt with invalid username', { username });
        return NextResponse.json(
          createApiResponse(undefined, 'Invalid username or password'),
          { status: 401 }
        );
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        logger.warn('Login attempt with invalid password', { username });
        return NextResponse.json(
          createApiResponse(undefined, 'Invalid username or password'),
          { status: 401 }
        );
      }

      // Update last login
      await query(
        'UPDATE users SET last_login = NOW() WHERE username = $1',
        [username]
      );

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        elo: user.elo
      });

      // Return user data without password hash
      const userResponse: UserResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        flag: user.flag,
        team: user.team,
        weight: user.weight,
        gender: user.gender,
        elo: user.elo,
        created_at: user.created_at
      };

      logger.info('Successful login', { username: user.username });
      return NextResponse.json(
        createApiResponse({ user: userResponse, token }, undefined, 'Login successful'),
        { status: 200 }
      );

    } catch (dbError: any) {
      logger.error('Database error during login', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Login failed due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    logger.error('Login error', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
} 