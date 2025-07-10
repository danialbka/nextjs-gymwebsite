import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { calculateDotsScore, createApiResponse } from '@/lib/utils';
import { LeaderboardEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // Optional filter for gender

    try {
      // Get users with weight and gender for DOTS calculation
      let queryText = `
        SELECT username, display_name, email, flag, team, weight, gender, elo, created_at 
        FROM users 
        WHERE is_active = TRUE
      `;
      const queryParams: any[] = [];

      // Add gender filter if specified
      if (gender && ['male', 'female'].includes(gender)) {
        queryText += ' AND gender = $1';
        queryParams.push(gender);
      }

      queryText += ' ORDER BY elo DESC LIMIT 50';

      const usersResult = await query(queryText, queryParams);
      const users = usersResult.rows;

      // Get lift data for each user
      const leaderboardEntries: LeaderboardEntry[] = await Promise.all(
        users.map(async (user: any) => {
          // Get best lifts for each type
          const liftsResult = await query(
            `SELECT lift_type, MAX(weight) as max_weight
             FROM prs 
             WHERE username = $1
             GROUP BY lift_type`,
            [user.username]
          );

          const lifts = liftsResult.rows;
          const liftData = { bench: 0, squat: 0, deadlift: 0 };

          // Map lifts to the lift data object
          lifts.forEach((lift: any) => {
            liftData[lift.lift_type as keyof typeof liftData] = parseFloat(lift.max_weight);
          });

          const totalLifted = liftData.bench + liftData.squat + liftData.deadlift;

          // Calculate DOTS score if user has weight and gender
          let dotsScore = 0;
          if (user.weight && user.gender && totalLifted > 0) {
            dotsScore = calculateDotsScore(totalLifted, user.weight, user.gender);
          }

          return {
            username: user.username,
            display_name: user.display_name,
            flag: user.flag,
            team: user.team,
            weight: user.weight,
            gender: user.gender,
            elo: user.elo,
            bench: liftData.bench,
            squat: liftData.squat,
            deadlift: liftData.deadlift,
            total_lifted: totalLifted,
            dots_score: dotsScore
          };
        })
      );

      // Sort by ELO (already sorted by query, but keeping for clarity)
      leaderboardEntries.sort((a, b) => b.elo - a.elo);

      return NextResponse.json(
        createApiResponse(leaderboardEntries, undefined, 'Leaderboard retrieved successfully'),
        { status: 200 }
      );

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        createApiResponse(undefined, 'Failed to retrieve leaderboard due to database error'),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
} 