'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Team, TeamMember, ApiResponse } from '@/lib/types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam);
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    setIsLoadingTeams(true);
    setError('');

    try {
      const response = await fetchAPI<ApiResponse<Team[]>>('/api/teams');

      if (response.success && response.data) {
        setTeams(response.data);
      } else {
        setError('Failed to load teams');
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError('Network error loading teams');
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const loadTeamMembers = async (teamName: string) => {
    setIsLoadingMembers(true);

    try {
      const response = await fetchAPI<ApiResponse<TeamMember[]>>(`/api/teams?team=${encodeURIComponent(teamName)}`);

      if (response.success && response.data && Array.isArray(response.data)) {
        setTeamMembers(response.data);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
      setTeamMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const getTeamRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getMemberRankBadge = (index: number) => {
    if (index === 0) return '👑';
    return `#${index + 1}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Teams 👥</h1>
        <p className="text-muted-foreground">Explore teams and their members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teams List */}
        <div className="bg-card border-2 border-border p-6">
          <h2 className="text-xl font-semibold mb-6 text-card-foreground">Team Rankings</h2>
          
          {isLoadingTeams ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading teams...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={loadTeams}
                className="text-primary hover:text-primary/80 underline"
              >
                Try again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No teams found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team, index) => (
                <div
                  key={team.team}
                  className={`p-4 cursor-pointer transition-colors border-2 ${
                    selectedTeam === team.team
                      ? 'bg-accent border-primary'
                      : 'bg-muted hover:bg-accent border-border'
                  }`}
                  onClick={() => setSelectedTeam(selectedTeam === team.team ? '' : team.team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTeamRankBadge(index)}</span>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{team.team}</h3>
                        <p className="text-sm text-muted-foreground">{team.member_count} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Avg ELO</div>
                      <div className="font-bold text-primary">{team.avg_elo}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">Top ELO: <span className="font-medium">{team.top_elo}</span></span>
                    <span className="text-primary text-xs">
                      {selectedTeam === team.team ? 'Click to collapse' : 'Click to view members'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="bg-card border-2 border-border p-6">
          <h2 className="text-xl font-semibold mb-6 text-card-foreground">
            {selectedTeam ? `${selectedTeam} Members` : 'Team Members'}
          </h2>
          
          {!selectedTeam ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Select a team to view its members</p>
            </div>
          ) : isLoadingMembers ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(teamMembers) && teamMembers.map((member, index) => (
                <div key={member.username} className="p-4 bg-muted border-2 border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getMemberRankBadge(index)}</span>
                      <span className="text-lg">{member.flag}</span>
                      <div>
                        <div className="font-medium text-card-foreground">
                          {member.display_name || member.username}
                        </div>
                        {member.display_name && (
                          <div className="text-sm text-muted-foreground">@{member.username}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">ELO</div>
                      <div className="font-bold text-primary">{member.elo}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Team Stats Summary */}
              <div className="mt-6 p-4 bg-accent border-2 border-border">
                <h3 className="font-semibold text-accent-foreground mb-2">Team Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-accent-foreground">Members:</span>
                    <span className="font-medium ml-1">{teamMembers.length}</span>
                  </div>
                  <div>
                    <span className="text-accent-foreground">Avg ELO:</span>
                    <span className="font-medium ml-1">
                      {teamMembers.length > 0 
                        ? Math.round(teamMembers.reduce((sum, m) => sum + m.elo, 0) / teamMembers.length)
                        : 0
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-accent-foreground">Highest ELO:</span>
                    <span className="font-medium ml-1">
                      {teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.elo)) : 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-accent-foreground">Lowest ELO:</span>
                    <span className="font-medium ml-1">
                      {teamMembers.length > 0 ? Math.min(...teamMembers.map(m => m.elo)) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 