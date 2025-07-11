'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { UserWithLifts, ApiResponse } from '@/lib/types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserWithLifts[]>([]);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [genderFilter]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = genderFilter === 'all' ? '/api/leaderboard' : `/api/leaderboard?gender=${genderFilter}`;
      const response = await fetchAPI<ApiResponse<UserWithLifts[]>>(endpoint);

      if (response.success && response.data) {
        setLeaderboard(response.data);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setError('Network error loading leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getEloColor = (elo: number) => {
    if (elo >= 1500) return 'text-purple-600 font-bold';
    if (elo >= 1200) return 'text-blue-600 font-semibold';
    if (elo >= 1000) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Leaderboard 🏆</h1>
        <p className="text-muted-foreground">See how you rank against other lifters</p>
      </div>

      {/* Gender Filter */}
      <div className="mb-6">
        <div className="bg-muted border-2 border-border p-1 flex space-x-1 w-fit">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              genderFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              genderFilter === 'male'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGenderFilter('female')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              genderFilter === 'female'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-card border-2 border-border overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="text-primary hover:text-primary/80 underline"
            >
              Try again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Lifter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ELO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    DOTS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Bench
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Squat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Deadlift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {leaderboard.map((user, index) => (
                  <tr key={`${user.id}-${index}`} className={index < 3 ? 'bg-accent' : 'hover:bg-muted'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      <span className="text-lg">{getRankBadge(index + 1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{user.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-card-foreground">
                            {user.display_name || user.username}
                          </div>
                          {user.display_name && (
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getEloColor(user.elo)}`}>
                        {user.elo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                      {user.dots_score ? user.dots_score.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                      {user.bench ? `${user.bench}kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                      {user.squat ? `${user.squat}kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                      {user.deadlift ? `${user.deadlift}kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      {user.total_lifted}kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {user.team}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-muted border-2 border-border p-4">
        <h3 className="text-sm font-medium text-card-foreground mb-2">ELO Ratings:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-purple-600 font-bold">1500+ Elite</span>
          <span className="text-blue-600 font-semibold">1200+ Advanced</span>
          <span className="text-green-600">1000+ Intermediate</span>
          <span className="text-muted-foreground">&lt;1000 Beginner</span>
        </div>
      </div>
    </div>
  );
} 