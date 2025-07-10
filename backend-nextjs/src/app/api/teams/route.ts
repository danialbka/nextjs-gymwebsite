import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createApiResponse } from '@/lib/utils';
import { Team, TeamMember } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('team');

    if (teamName) {
      // Get specific team members
      return getTeamMembers(teamName);
    } else {
      // Get all teams
      return getAllTeams();
    }

  } catch (error: any) {
    console.error('Teams error:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Internal server error'),
      { status: 500 }
    );
  }
}

async function getAllTeams(): Promise<NextResponse> {
  try {
    // Get team statistics
    const teamsResult = await query(`
      SELECT 
        COALESCE(team, 'Independent') as team,
        COUNT(*) as member_count,
        ROUND(AVG(elo), 2) as avg_elo,
        MAX(elo) as top_elo
      FROM users 
      WHERE is_active = TRUE 
      GROUP BY COALESCE(team, 'Independent')
      HAVING COUNT(*) > 0
      ORDER BY avg_elo DESC
    `);

    const teams: Team[] = teamsResult.rows.map((row: any) => ({
      team: row.team,
      member_count: parseInt(row.member_count),
      avg_elo: parseFloat(row.avg_elo),
      top_elo: row.top_elo
    }));

    return NextResponse.json(
      createApiResponse(teams, undefined, 'Teams retrieved successfully'),
      { status: 200 }
    );

  } catch (dbError: any) {
    console.error('Database error:', dbError);
    return NextResponse.json(
      createApiResponse(undefined, 'Failed to retrieve teams due to database error'),
      { status: 500 }
    );
  }
}

async function getTeamMembers(teamName: string): Promise<NextResponse> {
  try {
    // Get team members
    const membersResult = await query(`
      SELECT username, display_name, flag, elo
      FROM users 
      WHERE COALESCE(team, 'Independent') = $1 AND is_active = TRUE
      ORDER BY elo DESC
    `, [teamName]);

    const members: TeamMember[] = membersResult.rows.map((row: any) => ({
      username: row.username,
      display_name: row.display_name,
      flag: row.flag,
      elo: row.elo
    }));

    if (members.length === 0) {
      return NextResponse.json(
        createApiResponse(undefined, 'Team not found or has no members'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse(
        {
          team: teamName,
          members
        },
        undefined,
        'Team members retrieved successfully'
      ),
      { status: 200 }
    );

  } catch (dbError: any) {
    console.error('Database error:', dbError);
    return NextResponse.json(
      createApiResponse(undefined, 'Failed to retrieve team members due to database error'),
      { status: 500 }
    );
  }
} 