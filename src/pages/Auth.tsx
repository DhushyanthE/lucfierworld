import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { ForgotPassword } from '@/components/auth/ForgotPassword';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Handle password reset callback
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      setIsResettingPassword(true);
    }
  }, [location]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Password must include uppercase, lowercase, number, and special character');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Password updated successfully!');
      setIsResettingPassword(false);
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/');
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Password update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (loginPassword.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(signupPassword);
    const hasLowerCase = /[a-z]/.test(signupPassword);
    const hasNumber = /\d/.test(signupPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Password must include uppercase, lowercase, number, and special character');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! You can now login.');
        // Switch to login tab
        setLoginEmail(signupEmail);
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show password reset form
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min 12 chars, complex"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={12}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Must include uppercase, lowercase, number, and special character
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={12}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Quantum Blockchain</CardTitle>
          <CardDescription>
            Secure authentication powered by quantum-resistant cryptography
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    minLength={12}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 12 chars, complex"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={12}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must include uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    minLength={12}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Shield className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
