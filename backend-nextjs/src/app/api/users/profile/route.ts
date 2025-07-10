import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createApiResponse, validateEmail, validateUsername, verifyAuthToken } from '@/lib/utils';
import { ProfileUpdateRequest, UserResponse } from '@/lib/types';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        createApiResponse(undefined, 'Username is required'),
        { status: 400 }
      );
    }

    try {
      // Get user data
      const userResult = await query(
        `SELECT id, username, email, display_name, flag, team, weight, gender, elo, created_at 
         FROM users WHERE username = $1 AND is_active = TRUE`,
        [username]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          createApiResponse(undefined, 'User not found'),
          { status: 404 }
        );
      }

      const user: UserResponse = userResult.rows[0];

      // Get user's PRs
      const prsResult = await query(
        'SELECT lift_type, weight, created_at FROM prs WHERE username = $1 ORDER BY created_at DESC',
        [username]
      );

      return NextResponse.json(
        createApiResponse(
          {
            user,
            prs: prsResult.rows
          },
          undefined,
          'Profile retrieved successfully'
        ),
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Failed to retrieve profile due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Profile retrieval error:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        createApiResponse(undefined, authResult.error),
        { status: 401 }
      );
    }

    const body: ProfileUpdateRequest = await request.json();
    const { username, new_username, email, display_name, team, weight, gender } = body;

    if (!username) {
      return NextResponse.json(
        createApiResponse(undefined, 'Current username is required'),
        { status: 400 }
      );
    }

    // Ensure user can only update their own profile
    if (authResult.user.username !== username) {
      return NextResponse.json(
        createApiResponse(undefined, 'You can only update your own profile'),
        { status: 403 }
      );
    }

    try {
      // Check if user exists
      const userResult = await query(
        'SELECT id FROM users WHERE username = $1 AND is_active = TRUE',
        [username]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          createApiResponse(undefined, 'User not found'),
          { status: 404 }
        );
      }

      // Validate new username if provided
      if (new_username && new_username !== username) {
        const usernameValidation = validateUsername(new_username);
        if (!usernameValidation.valid) {
          return NextResponse.json(
            createApiResponse(undefined, usernameValidation.message),
            { status: 400 }
          );
        }

        // Check if new username already exists
        const existingUserResult = await query(
          'SELECT username FROM users WHERE username = $1',
          [new_username]
        );

        if (existingUserResult.rows.length > 0) {
          return NextResponse.json(
            createApiResponse(undefined, 'Username already exists'),
            { status: 400 }
          );
        }
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        return NextResponse.json(
          createApiResponse(undefined, 'Invalid email format'),
          { status: 400 }
        );
      }

      // Check if email already exists (if provided and different)
      if (email) {
        const existingEmailResult = await query(
          'SELECT email FROM users WHERE email = $1 AND username != $2',
          [email, username]
        );

        if (existingEmailResult.rows.length > 0) {
          return NextResponse.json(
            createApiResponse(undefined, 'Email already exists'),
            { status: 400 }
          );
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      if (new_username && new_username !== username) {
        updateFields.push(`username = $${paramCount++}`);
        updateValues.push(new_username);
      }

      if (email !== undefined) {
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(email || null);
      }

      if (display_name !== undefined) {
        updateFields.push(`display_name = $${paramCount++}`);
        updateValues.push(display_name);
      }

      if (team !== undefined) {
        updateFields.push(`team = $${paramCount++}`);
        updateValues.push(team || 'Independent');
      }

      if (weight !== undefined) {
        updateFields.push(`weight = $${paramCount++}`);
        updateValues.push(weight);
      }

      if (gender !== undefined) {
        updateFields.push(`gender = $${paramCount++}`);
        updateValues.push(gender);
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          createApiResponse(undefined, 'No fields to update'),
          { status: 400 }
        );
      }

      // Add username parameter for WHERE clause
      updateValues.push(username);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE username = $${paramCount} 
        RETURNING id, username, email, display_name, flag, team, weight, gender, elo, created_at
      `;

      const updateResult = await query(updateQuery, updateValues);
      const updatedUser: UserResponse = updateResult.rows[0];

      return NextResponse.json(
        createApiResponse(updatedUser, undefined, 'Profile updated successfully'),
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Failed to update profile due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
} 