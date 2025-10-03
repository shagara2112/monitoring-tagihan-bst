'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        // Force a page reload to ensure auth state is updated
        window.location.href = '/';
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the invoice management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        
          {/* Test credentials info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</p>
          <div className="space-y-2 text-xs text-gray-600">
            <div>
              <p className="font-semibold text-purple-700">👑 Super Admin:</p>
              <p>• superadmin@monitoring.com / superadmin123</p>
              <p>• admin@monitoring.com / admin123</p>
              <p>• sa@monitoring.com / password123</p>
            </div>
            <div>
              <p className="font-semibold text-blue-700">🔷 Admin:</p>
              <p>• admin@finance.com / manager123</p>
            </div>
            <div>
              <p className="font-semibold text-green-700">👔 Manager:</p>
              <p>• manager@monitoring.com / manager123</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">👤 Staff:</p>
              <p>• staff@monitoring.com / staff123</p>
              <p>• user@monitoring.com / user123</p>
              <p>• mitra@monitoring.com / mitra123</p>
              <p>• finance@monitoring.com / staff123</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}