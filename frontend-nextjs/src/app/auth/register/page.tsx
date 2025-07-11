'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAPI, validateRequiredFields } from '@/lib/api';
import { RegisterForm, ApiResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Flag options
const FLAGS = [
  '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇳🇱', '🇸🇪',
  '🇳🇴', '🇩🇰', '🇫🇮', '🇵🇱', '🇨🇿', '🇭🇺', '🇷🇴', '🇧🇬', '🇭🇷', '🇸🇮',
  '🇱🇹', '🇱🇻', '🇪🇪', '🇸🇰', '🇺🇦', '🇷🇺', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳',
  '🇦🇪', '🇸🇦', '🇮🇱', '🇹🇷', '🇬🇷', '🇵🇹', '🇦🇹', '🇨🇭', '🇧🇪', '🇮🇪',
  '🇲🇽', '🇧🇷', '🇦🇷', '🇨🇱', '🇨🇴', '🇿🇦', '🇪🇬', '🇳🇬', '🇰🇪', '🇬🇭',
  '🇹🇭', '🇻🇳', '🇮🇩', '🇲🇾', '🇸🇬', '🇵🇭', '🇳🇿', '🇫🇯'
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    team: '',
    weight: 0,
    gender: 'male',
    flag: '🇺🇸'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) setErrors([]);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    // Client-side validation
    const requiredFields = ['username', 'password', 'team'];
    const missingFields = validateRequiredFields(formData, requiredFields);
    
    if (missingFields.length > 0) {
      setErrors([`Please fill in: ${missingFields.join(', ')}`]);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(['Passwords do not match']);
      setIsLoading(false);
      return;
    }

    if (formData.weight <= 0) {
      setErrors(['Weight must be greater than 0']);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchAPI<ApiResponse>('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.success) {
        router.push('/auth/login?message=Registration successful! Please login.');
      } else {
        setErrors([response.error || 'Registration failed']);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <Card className="bg-card border-2 border-border">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary flex items-center justify-center">
              <span className="text-4xl">🚀</span>
            </div>
            <CardTitle className="text-3xl font-bold text-card-foreground">
              Join GymRank
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Start your powerlifting journey today
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.length > 0 && (
                <div className="bg-destructive text-destructive-foreground px-4 py-3 border-2 border-destructive">
                  {errors.map((error, index) => (
                    <div key={index} className="text-center font-medium">{error}</div>
                  ))}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-card-foreground">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-card-foreground">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring"
                    placeholder="Enter a password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-card-foreground">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring"
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-semibold text-card-foreground">
                    Team *
                  </Label>
                  <Input
                    id="team"
                    name="team"
                    type="text"
                    required
                    value={formData.team}
                    onChange={handleInputChange}
                    className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring"
                    placeholder="Enter your team name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-semibold text-card-foreground">
                      Weight (kg) *
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="1"
                      required
                      value={formData.weight || ''}
                      onChange={handleInputChange}
                      className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring"
                      placeholder="70"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold text-card-foreground">
                      Gender *
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                      <SelectTrigger className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-border">
                        <SelectItem value="male">👨 Male</SelectItem>
                        <SelectItem value="female">👩 Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flag" className="text-sm font-semibold text-card-foreground">
                    Country Flag *
                  </Label>
                  <Select value={formData.flag} onValueChange={(value) => handleSelectChange('flag', value)}>
                    <SelectTrigger className="h-12 text-lg border-2 border-border bg-input focus:border-ring focus:ring-ring">
                      <SelectValue placeholder="Select your flag" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 border-2 border-border">
                      {FLAGS.map((flag) => (
                        <SelectItem key={flag} value={flag}>
                          {flag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-b-2 border-current mr-3"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    💪 Create Account
                  </>
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 