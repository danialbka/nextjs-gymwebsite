import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createApiResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    try {
      let videosQuery: string;
      let queryParams: any[] = [];

      if (username) {
        // Get videos for specific user
        videosQuery = `
          SELECT p.id, p.username, p.lift_type, p.weight, p.video_url, p.created_at,
                 u.display_name, u.flag, u.team, u.elo
          FROM prs p
          JOIN users u ON p.username = u.username
          WHERE p.username = $1 AND p.video_url IS NOT NULL AND u.is_active = TRUE
          ORDER BY p.created_at DESC
        `;
        queryParams = [username];
      } else {
        // Get all videos/posts
        videosQuery = `
          SELECT p.id, p.username, p.lift_type, p.weight, p.video_url, p.created_at,
                 u.display_name, u.flag, u.team, u.elo
          FROM prs p
          JOIN users u ON p.username = u.username
          WHERE p.video_url IS NOT NULL AND u.is_active = TRUE
          ORDER BY p.created_at DESC
          LIMIT 50
        `;
      }

      const videosResult = await query(videosQuery, queryParams);

      const videos = videosResult.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        flag: row.flag,
        team: row.team,
        elo: row.elo,
        lift_type: row.lift_type,
        weight: row.weight,
        video_url: row.video_url,
        created_at: row.created_at
      }));

      return NextResponse.json(
        createApiResponse(videos, undefined, 'Videos retrieved successfully'),
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Failed to retrieve videos due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Videos error:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing posts
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    const username = searchParams.get('username');

    if (!postId || !username) {
      return NextResponse.json(
        createApiResponse(undefined, 'Post ID and username are required'),
        { status: 400 }
      );
    }

    try {
      // Verify the post belongs to the user
      const postResult = await query(
        'SELECT id, username FROM prs WHERE id = $1 AND username = $2',
        [postId, username]
      );

      if (postResult.rows.length === 0) {
        return NextResponse.json(
          createApiResponse(undefined, 'Post not found or unauthorized'),
          { status: 404 }
        );
      }

      // Delete the post
      await query('DELETE FROM prs WHERE id = $1', [postId]);

      return NextResponse.json(
        createApiResponse(undefined, undefined, 'Post deleted successfully'),
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Failed to delete post due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
} 