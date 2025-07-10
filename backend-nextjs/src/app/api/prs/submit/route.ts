import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { calculateElo, createApiResponse, verifyAuthToken, validateVideoUrl, logger } from '@/lib/utils';
import { PRSubmissionRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        createApiResponse(undefined, authResult.error),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, lift_type, weight, video_url } = body;

    // Validate required fields
    if (!username || !lift_type || !weight) {
      return NextResponse.json(
        createApiResponse(undefined, 'Username, lift type, and weight are required'),
        { status: 400 }
      );
    }

    // Ensure user can only submit PRs for themselves
    if (authResult.user.username !== username) {
      return NextResponse.json(
        createApiResponse(undefined, 'You can only submit PRs for your own account'),
        { status: 403 }
      );
    }

    // Validate lift type
    if (!['bench', 'squat', 'deadlift'].includes(lift_type)) {
      return NextResponse.json(
        createApiResponse(undefined, 'Invalid lift type. Must be bench, squat, or deadlift'),
        { status: 400 }
      );
    }

    // Validate weight
    if (typeof weight !== 'number' || weight <= 0 || weight > 1000) {
      return NextResponse.json(
        createApiResponse(undefined, 'Weight must be a positive number between 0 and 1000 kg'),
        { status: 400 }
      );
    }

    // Validate video URL if provided
    if (video_url) {
      const videoValidation = validateVideoUrl(video_url);
      if (!videoValidation.valid) {
        return NextResponse.json(
          createApiResponse(undefined, videoValidation.message),
          { status: 400 }
        );
      }
    }

    try {
      // Check if user exists
      const userResult = await query(
        'SELECT username FROM users WHERE username = $1 AND is_active = TRUE',
        [username]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          createApiResponse(undefined, 'User not found'),
          { status: 404 }
        );
      }

      // Insert the PR
      const prResult = await query(
        'INSERT INTO prs (username, lift_type, weight, video_url) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
        [username, lift_type, weight, video_url || null]
      );

      // Calculate and update ELO
      await updateUserElo(username);

      logger.info('PR submitted successfully', { username, lift_type, weight });
      return NextResponse.json(
        createApiResponse(
          {
            id: prResult.rows[0].id,
            username,
            lift_type,
            weight,
            video_url,
            created_at: prResult.rows[0].created_at
          },
          undefined,
          'PR submitted successfully and ELO updated'
        ),
        { status: 201 }
      );

    } catch (dbError: any) {
      logger.error('Database error during PR submission', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Failed to submit PR due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    logger.error('PR submission error', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
}

// Helper function to update user ELO based on their total lifts
async function updateUserElo(username: string): Promise<void> {
  try {
    // Get all PRs for the user
    const prsResult = await query(
      'SELECT weight FROM prs WHERE username = $1',
      [username]
    );

    // Calculate total weight lifted
    const totalWeight = prsResult.rows.reduce((sum: number, pr: any) => sum + parseFloat(pr.weight), 0);

    // Calculate new ELO
    const newElo = calculateElo(totalWeight);

    // Update user's ELO
    await query(
      'UPDATE users SET elo = $1 WHERE username = $2',
      [newElo, username]
    );

  } catch (error) {
    console.error('Error updating ELO:', error);
    throw error;
  }
} 