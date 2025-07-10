import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword, validateUsername, validatePassword, validateEmail, createApiResponse } from '@/lib/utils';
import { RegisterRequest, UserResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, password, email, display_name, flag, team, weight, gender } = body;

    // Validate required fields
    if (!username || !password || !flag || !gender) {
      return NextResponse.json(
        createApiResponse(null, 'Username, password, flag, and gender are required'),
        { status: 400 }
      );
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        createApiResponse(null, usernameValidation.message),
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        createApiResponse(null, passwordValidation.message),
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return NextResponse.json(
        createApiResponse(null, 'Invalid email format'),
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    try {
      // Check if user already exists
      const existingUserResult = await query(
        'SELECT username FROM users WHERE username = $1',
        [username]
      );
      
      if (existingUserResult.rows.length > 0) {
        return NextResponse.json(
          createApiResponse(null, 'Username already exists'),
          { status: 400 }
        );
      }

      // Check if email already exists (if provided)
      if (email) {
        const existingEmailResult = await query(
          'SELECT email FROM users WHERE email = $1',
          [email]
        );
        
        if (existingEmailResult.rows.length > 0) {
          return NextResponse.json(
            createApiResponse(null, 'Email already exists'),
            { status: 400 }
          );
        }
      }

      // Insert new user
      const insertResult = await query(
        `INSERT INTO users (username, password_hash, email, display_name, flag, team, weight, gender) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, username, email, display_name, flag, team, weight, gender, elo, created_at`,
        [
          username,
          passwordHash,
          email || null,
          display_name || username,
          flag,
          team || 'Independent',
          weight || null,
          gender
        ]
      );

      const user: UserResponse = insertResult.rows[0];

      return NextResponse.json(
        createApiResponse(user, undefined, 'User registered successfully'),
        { status: 201 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        createApiResponse(null, 'Registration failed due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      createApiResponse(null, 'Internal server error'),
      { status: 500 }
    );
  }
} 