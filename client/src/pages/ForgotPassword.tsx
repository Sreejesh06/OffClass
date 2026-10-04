import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message || 'Check your email for a reset link.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-black">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Forgot Password</CardTitle>
          <CardDescription>
            Enter your college email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded font-mono text-sm mb-4">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  College Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@sece.ac.in"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-black focus:ring-0 transition-colors font-mono"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded font-mono">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm font-medium text-gray-600">
            Remembered it? <Link to="/login" className="text-black font-bold hover:underline underline-offset-4">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
