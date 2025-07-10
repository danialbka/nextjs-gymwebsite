'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI, getAuthHeaders } from '@/lib/api';
import { Video, ApiResponse } from '@/lib/types';

export default function VideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    loadVideos();
  }, [selectedUser]);

  const loadVideos = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = selectedUser ? `/api/videos?username=${selectedUser}` : '/api/videos';
      const response = await fetchAPI<ApiResponse<Video[]>>(endpoint);

      if (response.success && response.data) {
        setVideos(response.data);
      } else {
        setError('Failed to load videos');
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
      setError('Network error loading videos');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVideo = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetchAPI<ApiResponse>(`/api/videos?id=${videoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.success) {
        setVideos(prev => prev.filter(video => video.id !== videoId));
      } else {
        alert(response.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Network error. Please try again.');
    }
  };

  const getLiftTypeColor = (liftType: string) => {
    switch (liftType) {
      case 'bench': return 'bg-red-100 text-red-800';
      case 'squat': return 'bg-blue-100 text-blue-800';
      case 'deadlift': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLiftTypeEmoji = (liftType: string) => {
    switch (liftType) {
      case 'bench': return '🏋️‍♂️';
      case 'squat': return '🦵';
      case 'deadlift': return '💪';
      default: return '🏋️';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Videos 🎥</h1>
        <p className="text-gray-600">Watch lift videos from the community</p>
      </div>

      {/* Filter by User */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <label htmlFor="userFilter" className="text-sm font-medium text-gray-700">
            Filter by user:
          </label>
          <input
            id="userFilter"
            type="text"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            placeholder="Enter username..."
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {selectedUser && (
            <button
              onClick={() => setSelectedUser('')}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadVideos}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Try again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {selectedUser ? `No videos found for user "${selectedUser}"` : 'No videos available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Video */}
              <div className="aspect-video bg-gray-100">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="#f3f4f6"/><text x="200" y="120" text-anchor="middle" fill="#6b7280" font-size="16">Video</text></svg>')}`}
                >
                  <source src={video.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{video.flag}</span>
                    <span className="font-medium text-gray-900">{video.username}</span>
                    {video.team && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {video.team}
                      </span>
                    )}
                  </div>
                  {user && user.username === video.username && (
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                      title="Delete video"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getLiftTypeEmoji(video.lift_type)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLiftTypeColor(video.lift_type)}`}>
                      {video.lift_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{video.weight}kg</div>
                    {video.dots_score && (
                      <div className="text-xs text-gray-500">DOTS: {video.dots_score.toFixed(1)}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>ELO: {video.elo}</span>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 