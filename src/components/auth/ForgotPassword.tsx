import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          redirectUrl: `${window.location.origin}/#/auth`,
        },
      });

      if (error) {
        console.error('Password reset error:', error);
        // Still show success to prevent email enumeration
      }

      setIsSuccess(true);
      toast.success('If an account exists, a reset email will be sent.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      // Still show success to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            If an account exists for <span className="font-medium text-foreground">{email}</span>,
            you'll receive a password reset link shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
            <p>• Check your inbox and spam folder</p>
            <p>• The link expires in 1 hour</p>
            <p>• Click the link to create a new password</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Link
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
