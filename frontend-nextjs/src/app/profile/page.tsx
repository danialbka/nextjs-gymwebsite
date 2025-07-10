'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI, getAuthHeaders } from '@/lib/api';
import { UserWithLifts, ApiResponse, ProfileUpdateForm } from '@/lib/types';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserWithLifts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileUpdateForm>({
    username: '',
    new_username: '',
    team: '',
    weight: 0,
    gender: 'male'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
      setEditForm({
        username: user.username,
        new_username: user.username,
        team: user.team || '',
        weight: user.weight || 0,
        gender: user.gender || 'male'
      });
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchAPI<ApiResponse<UserWithLifts>>(`/api/users/profile?username=${user.username}`, {
        headers: getAuthHeaders()
      });

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Network error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    
    if (updateMessage) setUpdateMessage('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateMessage('');

    if (!editForm.weight || editForm.weight <= 0) {
      setUpdateMessage('Weight must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchAPI<ApiResponse<UserWithLifts>>('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editForm),
      });

      if (response.success && response.data) {
        setProfile(response.data);
        updateUser(response.data); // Update auth context
        setUpdateMessage('Profile updated successfully! 🎉');
        setIsEditing(false);
      } else {
        setUpdateMessage(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUpdateMessage('');
    if (user) {
      setEditForm({
        username: user.username,
        new_username: user.username,
        team: user.team || '',
        weight: user.weight || 0,
        gender: user.gender || 'male'
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile ⚙️</h1>
        <p className="text-gray-600">Manage your account and view your stats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="new_username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="new_username"
                  name="new_username"
                  type="text"
                  required
                  value={editForm.new_username}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                  Team
                </label>
                <input
                  id="team"
                  name="team"
                  type="text"
                  required
                  value={editForm.team}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="1"
                    required
                    value={editForm.weight || ''}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={editForm.gender}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {updateMessage && (
                <div className={`p-3 rounded-md ${
                  updateMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-300'
                    : 'bg-red-50 text-red-700 border border-red-300'
                }`}>
                  {updateMessage}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{user.flag}</span>
                <div>
                  <div className="text-lg font-semibold">{user.display_name || user.username}</div>
                  {user.display_name && (
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Team</div>
                  <div className="font-medium">{user.team || 'No team'}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Weight</div>
                  <div className="font-medium">{user.weight ? `${user.weight}kg` : 'Not set'}</div>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Member since</div>
                <div className="font-medium text-blue-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Stats</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadProfile}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Try again
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">ELO Rating</div>
                  <div className="text-2xl font-bold text-blue-600">{profile.elo}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">DOTS Score</div>
                  <div className="text-2xl font-bold text-green-600">
                    {profile.dots_score ? profile.dots_score.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Personal Records</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xs text-gray-600">Bench Press</div>
                    <div className="text-lg font-bold text-red-600">
                      {profile.bench ? `${profile.bench}kg` : 'No PR'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600">Squat</div>
                    <div className="text-lg font-bold text-blue-600">
                      {profile.squat ? `${profile.squat}kg` : 'No PR'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600">Deadlift</div>
                    <div className="text-lg font-bold text-green-600">
                      {profile.deadlift ? `${profile.deadlift}kg` : 'No PR'}
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Lifted</div>
                  <div className="text-xl font-bold text-purple-600">
                    {profile.total_lifted}kg
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No stats available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 