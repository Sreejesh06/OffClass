import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-red-500">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-red-600">Invalid Link</CardTitle>
            <CardDescription>No reset token provided in the URL.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setStatus('loading');
    try {
      await api.post('/auth/reset-password', { token, password });
      setStatus('success');
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-black">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded font-mono text-sm">
              {message} Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-black focus:ring-0 transition-colors font-mono"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded font-mono">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
