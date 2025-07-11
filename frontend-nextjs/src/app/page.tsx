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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserWithLifts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prForm, setPrForm] = useState<PRSubmissionForm>({
    username: '',
    lift_type: 'bench',
    weight: 0,
    instagram_url: ''
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
    
    setPrForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    
    // Clear messages when user starts typing
    if (submitMessage) setSubmitMessage('');
  };

  const handlePrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    if (!prForm.instagram_url.trim()) {
      setSubmitMessage('Please enter an Instagram URL');
      setIsSubmitting(false);
      return;
    }

    // Validate Instagram URL format
    const instagramUrlRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?(\?.*)?$/;
    if (!instagramUrlRegex.test(prForm.instagram_url)) {
      setSubmitMessage('Please enter a valid Instagram post/reel URL');
      setIsSubmitting(false);
      return;
    }

    if (prForm.weight <= 0) {
      setSubmitMessage('Weight must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        username: prForm.username,
        lift_type: prForm.lift_type,
        weight: prForm.weight,
        video_url: prForm.instagram_url
      };

      const response = await fetchAPI<ApiResponse>('/api/prs/submit', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      if (response.success) {
        setSubmitMessage('PR submitted successfully! 🎉');
        setPrForm(prev => ({ ...prev, weight: 0, instagram_url: '' }));
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="mb-16">
              <h1 className="text-6xl font-bold text-foreground mb-6">
                🏋️ GymRank
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Competitive lifting platform inspired by Bakugan rankings
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold transition-colors">
                  Get Started Today
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-border text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold transition-colors">
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="bg-card border-2 border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary flex items-center justify-center text-2xl">
                    🏋️‍♂️
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-card-foreground">Track Your PRs</h3>
                  <p className="text-muted-foreground mb-4">Record and monitor your personal records across all three powerlifting movements</p>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Essential</Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-2 border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-card-foreground">Compete & Rank</h3>
                  <p className="text-muted-foreground mb-4">Climb the global leaderboard and compete with lifters worldwide using ELO ratings</p>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Competitive</Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-2 border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-card-foreground">Join Teams</h3>
                  <p className="text-muted-foreground mb-4">Create or join teams with friends and compete in team challenges</p>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Social</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Stats Preview */}
            <Card className="max-w-3xl mx-auto bg-card border-2 border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-card-foreground">Join the Community</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Thousands of lifters are already tracking their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary">2,847</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary">15,392</div>
                    <div className="text-sm text-muted-foreground">PRs Recorded</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary">127</div>
                    <div className="text-sm text-muted-foreground">Active Teams</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome back, {user.display_name || user.username}! 💪
          </h1>
          <p className="text-xl text-muted-foreground mb-6">Ready to break some records today?</p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2 text-lg border-2 border-border">
              🏋️‍♂️ Power Lifter
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-lg border-2 border-border">
              🔥 On Fire
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted border-2 border-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dashboard</TabsTrigger>
            <TabsTrigger value="submit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Submit PR</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Stats */}
              <Card className="lg:col-span-2 bg-card border-2 border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    📊 Your Performance
                  </CardTitle>
                  <CardDescription>Track your powerlifting journey</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading your stats...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="text-destructive text-6xl mb-4">⚠️</div>
                      <p className="text-destructive text-lg mb-2">{error}</p>
                      {error.includes('Network error') && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Make sure the backend server is running on port 3001
                        </p>
                      )}
                      <Button onClick={loadStats} variant="outline" className="mt-4 border-2 border-border">
                        🔄 Try Again
                      </Button>
                    </div>
                  ) : stats ? (
                    <div className="space-y-8">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-primary text-primary-foreground border-2 border-border">
                          <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2">🏆</div>
                            <div className="text-sm opacity-90">ELO Rating</div>
                            <div className="text-4xl font-bold">{stats.elo}</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-accent text-accent-foreground border-2 border-border">
                          <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2">⭐</div>
                            <div className="text-sm opacity-90">DOTS Score</div>
                            <div className="text-4xl font-bold">
                              {stats.dots_score ? stats.dots_score.toFixed(1) : 'N/A'}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Separator />

                      {/* Personal Records */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                          🏋️‍♂️ Personal Records
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-card border-2 border-border">
                            <CardContent className="p-6 text-center">
                              <div className="text-3xl mb-2">🔥</div>
                              <div className="text-sm text-muted-foreground font-medium">Bench Press</div>
                              <div className="text-3xl font-bold text-primary">
                                {stats.bench ? `${stats.bench}kg` : 'No PR'}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-card border-2 border-border">
                            <CardContent className="p-6 text-center">
                              <div className="text-3xl mb-2">💪</div>
                              <div className="text-sm text-muted-foreground font-medium">Squat</div>
                              <div className="text-3xl font-bold text-primary">
                                {stats.squat ? `${stats.squat}kg` : 'No PR'}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-card border-2 border-border">
                            <CardContent className="p-6 text-center">
                              <div className="text-3xl mb-2">⚡</div>
                              <div className="text-sm text-muted-foreground font-medium">Deadlift</div>
                              <div className="text-3xl font-bold text-primary">
                                {stats.deadlift ? `${stats.deadlift}kg` : 'No PR'}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Card className="bg-card border-2 border-border">
                          <CardContent className="p-6 text-center">
                            <div className="text-4xl mb-2">🎯</div>
                            <div className="text-sm text-muted-foreground font-medium">Total Lifted</div>
                            <div className="text-4xl font-bold text-primary">
                              {stats.total_lifted}kg
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📈</div>
                      <p className="text-card-foreground text-lg">No stats available yet</p>
                      <p className="text-sm text-muted-foreground">Submit your first PR to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card border-2 border-border">
                <CardHeader>
                  <CardTitle className="text-xl">🚀 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    📊 View Leaderboard
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-border">
                    📹 Watch Videos
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-border">
                    👥 Join a Team
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-border">
                    👤 Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submit">
            <Card className="max-w-2xl mx-auto bg-card border-2 border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  🏋️‍♂️ Submit New PR
                </CardTitle>
                <CardDescription className="text-center">
                  Record your latest personal record and compete with others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePrSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="lift_type" className="text-lg font-semibold">Lift Type</Label>
                    <Select value={prForm.lift_type} onValueChange={(value) => setPrForm(prev => ({ ...prev, lift_type: value as 'bench' | 'squat' | 'deadlift' }))}>
                      <SelectTrigger className="h-12 border-2 border-border">
                        <SelectValue placeholder="Select lift type" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-border">
                        <SelectItem value="bench">🔥 Bench Press</SelectItem>
                        <SelectItem value="squat">💪 Squat</SelectItem>
                        <SelectItem value="deadlift">⚡ Deadlift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-lg font-semibold">Weight (kg)</Label>
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
                      className="h-12 text-lg border-2 border-border bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram_url" className="text-lg font-semibold">Instagram Proof</Label>
                    <Input
                      id="instagram_url"
                      name="instagram_url"
                      type="url"
                      required
                      value={prForm.instagram_url}
                      onChange={handlePrFormChange}
                      placeholder="https://www.instagram.com/p/your-post-id/"
                      className="h-12 border-2 border-border bg-input"
                    />
                    <p className="text-sm text-muted-foreground">Enter the Instagram post/reel URL of your lift</p>
                  </div>

                  {submitMessage && (
                    <div className={`p-4 text-center font-medium border-2 ${
                      submitMessage.includes('successfully') 
                        ? 'bg-accent text-accent-foreground border-border'
                        : 'bg-destructive text-destructive-foreground border-destructive'
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {isSubmitting ? '⏳ Submitting...' : '🚀 Submit PR'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="bg-card border-2 border-border">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  📈 Progress Tracking
                </CardTitle>
                <CardDescription>Monitor your lifting journey over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Progress Charts Coming Soon!</h3>
                  <p className="text-muted-foreground">We're working on detailed progress tracking and analytics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
