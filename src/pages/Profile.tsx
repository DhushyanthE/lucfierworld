import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTOTP } from '@/hooks/useTOTP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Camera, Shield, Bell, User, Loader2, Copy, Check } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { SimpleNavBar } from '@/components/layout/SimpleNavBar';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { secret, loading: totpLoading, generateNewSecret, getOtpAuthUrl, enableTOTP, disableTOTP } = useTOTP();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when profile loads
  useState(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  });

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleNavBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      display_name: displayName || null,
      bio: bio || null,
    });
    setIsSaving(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const { error } = await uploadAvatar(file);
    if (error) {
      toast.error('Failed to upload avatar');
    } else {
      toast.success('Avatar updated successfully');
    }
  };

  const handleNotificationChange = async (key: 'notification_email' | 'notification_push' | 'notification_in_app', value: boolean) => {
    const { error } = await updateProfile({ [key]: value });
    if (error) {
      toast.error('Failed to update notification settings');
    }
  };

  const handleSetupTOTP = () => {
    generateNewSecret();
    setShowTOTPSetup(true);
    setTotpCode('');
  };

  const handleEnableTOTP = async () => {
    if (!secret || totpCode.length !== 6) return;

    const { error } = await enableTOTP(secret, totpCode);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Two-factor authentication enabled!');
      setShowTOTPSetup(false);
      setTotpCode('');
    }
  };

  const handleDisableTOTP = async () => {
    const { error } = await disableTOTP();
    if (error) {
      toast.error('Failed to disable 2FA');
    } else {
      toast.success('Two-factor authentication disabled');
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initials = (profile?.display_name || user.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavBar />
      <div className="container max-w-2xl py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your profile details and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="font-medium">{profile?.display_name || 'No display name'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security using TOTP
                  </p>
                </div>
                {profile?.totp_enabled ? (
                  <Button variant="destructive" size="sm" onClick={handleDisableTOTP} disabled={totpLoading}>
                    Disable 2FA
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSetupTOTP}>
                    Enable 2FA
                  </Button>
                )}
              </div>

              {showTOTPSetup && secret && (
                <div className="mt-4 p-4 border rounded-lg space-y-4 bg-muted/50">
                  <div>
                    <p className="font-medium mb-2">Setup Instructions:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                      <li>Add a new account and enter the secret key below</li>
                      <li>Enter the 6-digit code from the app to verify</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <div className="flex gap-2">
                      <Input value={secret} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="icon" onClick={copySecret}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <InputOTP maxLength={6} value={totpCode} onChange={setTotpCode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleEnableTOTP} disabled={totpCode.length !== 6 || totpLoading}>
                      {totpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Verify & Enable
                    </Button>
                    <Button variant="ghost" onClick={() => setShowTOTPSetup(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch
                  checked={profile?.notification_email ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('notification_email', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch
                  checked={profile?.notification_push ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('notification_push', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-muted-foreground">Show notifications in the app</p>
                </div>
                <Switch
                  checked={profile?.notification_in_app ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('notification_in_app', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
