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

      if (response.success && response.data) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Teams 👥</h1>
        <p className="text-gray-600">Explore teams and their members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teams List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Team Rankings</h2>
          
          {isLoadingTeams ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading teams...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadTeams}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Try again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No teams found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team, index) => (
                <div
                  key={team.team}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTeam === team.team
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => setSelectedTeam(selectedTeam === team.team ? '' : team.team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTeamRankBadge(index)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{team.team}</h3>
                        <p className="text-sm text-gray-600">{team.member_count} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Avg ELO</div>
                      <div className="font-bold text-blue-600">{team.avg_elo}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-gray-600">Top ELO: <span className="font-medium">{team.top_elo}</span></span>
                    <span className="text-blue-600 text-xs">
                      {selectedTeam === team.team ? 'Click to collapse' : 'Click to view members'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            {selectedTeam ? `${selectedTeam} Members` : 'Team Members'}
          </h2>
          
          {!selectedTeam ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Select a team to view its members</p>
            </div>
          ) : isLoadingMembers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={member.username} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getMemberRankBadge(index)}</span>
                      <span className="text-lg">{member.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.display_name || member.username}
                        </div>
                        {member.display_name && (
                          <div className="text-sm text-gray-500">@{member.username}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">ELO</div>
                      <div className="font-bold text-blue-600">{member.elo}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Team Stats Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Team Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Members:</span>
                    <span className="font-medium ml-1">{teamMembers.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Avg ELO:</span>
                    <span className="font-medium ml-1">
                      {teamMembers.length > 0 
                        ? Math.round(teamMembers.reduce((sum, m) => sum + m.elo, 0) / teamMembers.length)
                        : 0
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Highest ELO:</span>
                    <span className="font-medium ml-1">
                      {teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.elo)) : 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Lowest ELO:</span>
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