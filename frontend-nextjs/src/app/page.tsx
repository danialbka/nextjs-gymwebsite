'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI, getAuthHeaders } from '@/lib/api';
import { UserWithLifts, ApiResponse, PRSubmissionForm } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserWithLifts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prForm, setPrForm] = useState<PRSubmissionForm>({
    username: '',
    lift_type: 'bench',
    weight: 0,
    video: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const loadStats = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetchAPI<ApiResponse<UserWithLifts>>(`/api/users/profile?username=${user.username}`, {
        headers: getAuthHeaders()
      });
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load stats');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Network error loading stats');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setPrForm(prev => ({ ...prev, username: user.username }));
      loadStats();
    }
  }, [user, loadStats]);

  const handlePrFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      setPrForm(prev => ({ ...prev, [name]: file || null }));
    } else {
      setPrForm(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
    
    // Clear messages when user starts typing
    if (submitMessage) setSubmitMessage('');
  };

  const handlePrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    if (!prForm.video) {
      setSubmitMessage('Please select a video file');
      setIsSubmitting(false);
      return;
    }

    if (prForm.weight <= 0) {
      setSubmitMessage('Weight must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', prForm.username);
      formData.append('lift_type', prForm.lift_type);
      formData.append('weight', prForm.weight.toString());
      formData.append('video', prForm.video);

      const response = await fetchAPI<ApiResponse>('/api/prs/submit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (response.success) {
        setSubmitMessage('PR submitted successfully! 🎉');
        setPrForm(prev => ({ ...prev, weight: 0, video: null }));
        // Reset file input
        const fileInput = document.getElementById('video') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Reload stats
        loadStats();
      } else {
        setSubmitMessage(response.error || 'Failed to submit PR');
      }
    } catch (error) {
      console.error('PR submission error:', error);
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to GymRank 💪</h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your powerlifting progress, compete with friends, and climb the leaderboard!
          </p>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Join our powerlifting community to track your bench press, squat, and deadlift progress.
                Compete with teammates and see how you rank globally!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <Card className="p-4 bg-blue-50">
                  <div className="text-2xl mb-2">🏋️‍♂️</div>
                  <h3 className="font-semibold">Track PRs</h3>
                  <p className="text-sm text-muted-foreground">Record your personal records</p>
                </Card>
                <Card className="p-4 bg-green-50">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-semibold">Compete</h3>
                  <p className="text-sm text-muted-foreground">Climb the leaderboard</p>
                </Card>
                <Card className="p-4 bg-purple-50">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-semibold">Teams</h3>
                  <p className="text-sm text-muted-foreground">Join or create teams</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.display_name || user.username}! 💪
        </h1>
        <p className="text-gray-600">Ready to break some records today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stats Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              {error.includes('Network error') && (
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure the backend server is running on port 3001
                </p>
              )}
              <Button
                onClick={loadStats}
                variant="link"
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">ELO Rating</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.elo}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">DOTS Score</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.dots_score ? stats.dots_score.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Personal Records</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xs text-gray-600">Bench Press</div>
                    <div className="text-lg font-bold text-red-600">
                      {stats.bench ? `${stats.bench}kg` : 'No PR'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600">Squat</div>
                    <div className="text-lg font-bold text-blue-600">
                      {stats.squat ? `${stats.squat}kg` : 'No PR'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600">Deadlift</div>
                    <div className="text-lg font-bold text-green-600">
                      {stats.deadlift ? `${stats.deadlift}kg` : 'No PR'}
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Lifted</div>
                  <div className="text-xl font-bold text-purple-600">
                    {stats.total_lifted}kg
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No stats available</p>
            </div>
          )}
          </CardContent>
        </Card>

        {/* PR Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New PR</CardTitle>
          </CardHeader>
          <CardContent>
          
          <form onSubmit={handlePrSubmit} className="space-y-4">
            <div>
              <Label htmlFor="lift_type">Lift Type</Label>
              <Select value={prForm.lift_type} onValueChange={(value) => setPrForm(prev => ({ ...prev, lift_type: value as 'bench' | 'squat' | 'deadlift' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lift type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bench">Bench Press</SelectItem>
                  <SelectItem value="squat">Squat</SelectItem>
                  <SelectItem value="deadlift">Deadlift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min="1"
                step="0.5"
                required
                value={prForm.weight || ''}
                onChange={handlePrFormChange}
                placeholder="Enter weight lifted"
              />
            </div>

            <div>
              <Label htmlFor="video">Video Proof</Label>
              <Input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                required
                onChange={handlePrFormChange}
              />
              <p className="text-xs text-muted-foreground mt-1">Upload a video of your lift (max 50MB)</p>
            </div>

            {submitMessage && (
              <div className={`p-3 rounded-md ${
                submitMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-300'
                  : 'bg-red-50 text-red-700 border border-red-300'
              }`}>
                {submitMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit PR 🚀'}
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
