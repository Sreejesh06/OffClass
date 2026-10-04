import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Failed to verify email. The link may have expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-black">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && "Please wait while we verify your account..."}
            {status === 'success' && "You're all set!"}
            {status === 'error' && "Something went wrong."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 border-2 rounded font-mono text-sm ${status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
            {message}
          </div>
        </CardContent>
        {status !== 'loading' && (
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
