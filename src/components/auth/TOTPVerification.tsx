import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Loader2 } from 'lucide-react';

interface TOTPVerificationProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TOTPVerification({ onVerify, onCancel, isLoading }: TOTPVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    const success = await onVerify(code);
    if (!success) {
      setError('Invalid code. Please try again.');
      setCode('');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} disabled={isLoading}>
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

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="space-y-2">
          <Button 
            className="w-full" 
            onClick={handleVerify} 
            disabled={code.length !== 6 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
