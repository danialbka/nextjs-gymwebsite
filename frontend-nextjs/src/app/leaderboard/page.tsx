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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Leaderboard 🏆</h1>
        <p className="text-gray-600">See how you rank against other lifters</p>
      </div>

      {/* Gender Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              genderFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              genderFilter === 'male'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGenderFilter('female')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              genderFilter === 'female'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Try again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lifter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ELO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOTS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bench
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadlift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((user, index) => (
                  <tr key={user.id} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="text-lg">{getRankBadge(index + 1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{user.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name || user.username}
                          </div>
                          {user.display_name && (
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getEloColor(user.elo)}`}>
                        {user.elo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.dots_score ? user.dots_score.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.bench ? `${user.bench}kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.squat ? `${user.squat}kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.deadlift ? `${user.deadlift}kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.total_lifted}kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">ELO Ratings:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-purple-600 font-bold">1500+ Elite</span>
          <span className="text-blue-600 font-semibold">1200+ Advanced</span>
          <span className="text-green-600">1000+ Intermediate</span>
          <span className="text-gray-600">&lt;1000 Beginner</span>
        </div>
      </div>
    </div>
  );
} 