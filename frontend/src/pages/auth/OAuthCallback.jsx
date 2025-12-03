import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRoleHome } from '@/lib/auth';

export default function OAuthCallback() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            // Profile might not exist for new Google users, create it
            if (profileError.code === 'PGRST116') {
              const role = data.session.user.user_metadata?.role || 'student';
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.session.user.id,
                  email: data.session.user.email,
                  role: role,
                  full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
                });

              if (insertError) throw insertError;

              // Create role-specific details
              if (role === 'student') {
                await supabase.from('student_details').insert({ id: data.session.user.id });
              } else if (role === 'alumni') {
                await supabase.from('alumni_details').insert({ id: data.session.user.id });
              }

              // Navigate to profile setup
              setStatus('success');
              setMessage('Account created successfully! Setting up your profile...');
              setTimeout(() => {
                navigate('/profile/setup', { replace: true });
              }, 2000);
              return;
            }
            throw profileError;
          }

          // Store session info
          localStorage.setItem('supabase_session', JSON.stringify(data.session));

          // Navigate to role-based home
          const homeRoute = getRoleHome(profile.role);
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => {
            navigate(homeRoute, { replace: true });
          }, 2000);
        } else {
          throw new Error('No session found');
        }

      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err.message || 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Please wait while we complete your authentication'}
            {status === 'success' && 'You will be redirected shortly'}
            {status === 'error' && 'There was a problem with your authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'loading' && (
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
          {status === 'error' && (
            <XCircle className="h-8 w-8 text-red-600" />
          )}

          {message && (
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
