import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Simple TOTP implementation
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

function base32ToArrayBuffer(base32: string): ArrayBuffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  
  for (const char of base32.toUpperCase()) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const buffer = new ArrayBuffer(Math.floor(bits.length / 8));
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return buffer;
}

async function generateTOTP(secret: string, timeStep: number = 30): Promise<string> {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false);
  
  const keyData = base32ToArrayBuffer(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
  const signatureArray = new Uint8Array(signature);
  
  const offset = signatureArray[signatureArray.length - 1] & 0x0f;
  const binary = ((signatureArray[offset] & 0x7f) << 24) |
                 ((signatureArray[offset + 1] & 0xff) << 16) |
                 ((signatureArray[offset + 2] & 0xff) << 8) |
                 (signatureArray[offset + 3] & 0xff);
  
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export function useTOTP() {
  const { user } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateNewSecret = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);
    return newSecret;
  };

  const getOtpAuthUrl = (secretKey: string, email: string) => {
    const issuer = 'QuantumBlockchain';
    return `otpauth://totp/${issuer}:${encodeURIComponent(email)}?secret=${secretKey}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  };

  const verifyCode = async (code: string, secretToVerify: string): Promise<boolean> => {
    try {
      // Check current and adjacent time windows for clock drift tolerance
      for (let i = -1; i <= 1; i++) {
        const timeStep = 30;
        const time = Math.floor((Date.now() / 1000 + i * timeStep) / timeStep);
        const timeBuffer = new ArrayBuffer(8);
        const timeView = new DataView(timeBuffer);
        timeView.setUint32(4, time, false);
        
        const keyData = base32ToArrayBuffer(secretToVerify);
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-1' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
        const signatureArray = new Uint8Array(signature);
        
        const offset = signatureArray[signatureArray.length - 1] & 0x0f;
        const binary = ((signatureArray[offset] & 0x7f) << 24) |
                       ((signatureArray[offset + 1] & 0xff) << 16) |
                       ((signatureArray[offset + 2] & 0xff) << 8) |
                       (signatureArray[offset + 3] & 0xff);
        
        const otp = (binary % 1000000).toString().padStart(6, '0');
        if (otp === code) return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const enableTOTP = async (secretKey: string, verificationCode: string) => {
    if (!user) return { error: 'Not authenticated' };

    const isValid = await verifyCode(verificationCode, secretKey);
    if (!isValid) {
      return { error: 'Invalid verification code' };
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ totp_secret: secretKey, totp_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setSecret(null);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const disableTOTP = async () => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ totp_secret: null, totp_enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    secret,
    loading,
    generateNewSecret,
    getOtpAuthUrl,
    verifyCode,
    enableTOTP,
    disableTOTP,
  };
}
