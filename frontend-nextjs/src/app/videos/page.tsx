'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI, getAuthHeaders } from '@/lib/api';
import { Video, ApiResponse } from '@/lib/types';
import { getInstagramEmbedUrl } from '@/lib/utils';

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
      case 'bench': return 'bg-destructive/10 text-destructive';
      case 'squat': return 'bg-primary/10 text-primary';
      case 'deadlift': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
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
        <h1 className="text-3xl font-bold text-foreground mb-4">Videos 🎥</h1>
        <p className="text-muted-foreground">Watch lift videos from the community</p>
      </div>

      {/* Filter by User */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <label htmlFor="userFilter" className="text-sm font-medium text-foreground">
            Filter by user:
          </label>
          <input
            id="userFilter"
            type="text"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            placeholder="Enter username..."
            className="px-3 py-1 border-2 border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input"
          />
          {selectedUser && (
            <button
              onClick={() => setSelectedUser('')}
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={loadVideos}
            className="text-primary hover:text-primary/80 underline"
          >
            Try again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedUser ? `No videos found for user "${selectedUser}"` : 'No videos available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-card border-2 border-border overflow-hidden">
              {/* Instagram Embed */}
              <div className="aspect-video bg-muted">
                <iframe
                  src={getInstagramEmbedUrl(video.video_url)}
                  className="w-full h-full border-0"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency={true}
                  allow="encrypted-media"
                  title={`Instagram post by ${video.username}`}
                />
              </div>

              {/* Video Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{video.flag}</span>
                    <span className="font-medium text-card-foreground">{video.username}</span>
                    {video.team && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 border border-border">
                        {video.team}
                      </span>
                    )}
                  </div>
                  {user && user.username === video.username && (
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="text-destructive hover:text-destructive/80 text-sm"
                      title="Delete video"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getLiftTypeEmoji(video.lift_type)}</span>
                    <span className={`px-2 py-1 text-xs font-medium border border-border ${getLiftTypeColor(video.lift_type)}`}>
                      {video.lift_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-card-foreground">{video.weight}kg</div>
                    {video.dots_score && (
                      <div className="text-xs text-muted-foreground">DOTS: {video.dots_score.toFixed(1)}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
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