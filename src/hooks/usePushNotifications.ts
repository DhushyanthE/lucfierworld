 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 
// VAPID public key for web push notifications
// Generated via generate-vapid-keys edge function
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BKbYez7X0FWHiT2jO3l7CeH6sbbtRHK1vZZuEm1gTCtF0CGmOCjwzthUlQS_zW25q7H4uorvFR7c9Hk62CluNFI';
 
function urlBase64ToUint8Array(base64String: string): BufferSource {
   const padding = '='.repeat((4 - base64String.length % 4) % 4);
   const base64 = (base64String + padding)
     .replace(/-/g, '+')
     .replace(/_/g, '/');
   
   const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
   
   for (let i = 0; i < rawData.length; ++i) {
     outputArray[i] = rawData.charCodeAt(i);
   }
  return outputArray as unknown as BufferSource;
 }
 
 export function usePushNotifications() {
   const { user } = useAuth();
   const [permission, setPermission] = useState<NotificationPermission>('default');
   const [subscription, setSubscription] = useState<PushSubscription | null>(null);
   const [isSupported, setIsSupported] = useState(false);
   const [loading, setLoading] = useState(false);
 
   useEffect(() => {
     const supported = 'serviceWorker' in navigator && 'PushManager' in window;
     setIsSupported(supported);
     
     if (supported) {
       setPermission(Notification.permission);
       checkExistingSubscription();
     }
   }, []);
 
   const checkExistingSubscription = async () => {
     try {
       const registration = await navigator.serviceWorker.ready;
       const existingSub = await registration.pushManager.getSubscription();
       setSubscription(existingSub);
     } catch (error) {
       console.error('Error checking subscription:', error);
     }
   };
 
   const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
     try {
       const registration = await navigator.serviceWorker.register('/sw.js', {
         scope: '/'
       });
       await navigator.serviceWorker.ready;
       return registration;
     } catch (error) {
       console.error('Service worker registration failed:', error);
       return null;
     }
   };
 
   const subscribe = useCallback(async (): Promise<{ error: string | null }> => {
     if (!isSupported) {
       return { error: 'Push notifications are not supported in this browser' };
     }
 
     if (!VAPID_PUBLIC_KEY) {
       return { error: 'VAPID public key not configured' };
     }
 
     setLoading(true);
     try {
       // Request permission
       const permissionResult = await Notification.requestPermission();
       setPermission(permissionResult);
 
       if (permissionResult !== 'granted') {
         return { error: 'Notification permission denied' };
       }
 
       // Register service worker
       const registration = await registerServiceWorker();
       if (!registration) {
         return { error: 'Failed to register service worker' };
       }
 
       // Subscribe to push
       const pushSubscription = await registration.pushManager.subscribe({
         userVisibleOnly: true,
         applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
       });
 
       setSubscription(pushSubscription);
 
       // Save subscription to backend
       if (user) {
         const { error } = await supabase.functions.invoke('push-subscribe', {
           body: {
             subscription: pushSubscription.toJSON(),
             userId: user.id
           }
         });
 
         if (error) {
           console.error('Failed to save subscription to backend:', error);
         }
       }
 
       return { error: null };
     } catch (error: any) {
       console.error('Push subscription failed:', error);
       return { error: error.message || 'Failed to subscribe to push notifications' };
     } finally {
       setLoading(false);
     }
   }, [isSupported, user]);
 
   const unsubscribe = useCallback(async (): Promise<{ error: string | null }> => {
     if (!subscription) {
       return { error: 'No active subscription' };
     }
 
     setLoading(true);
     try {
       await subscription.unsubscribe();
       setSubscription(null);
 
       // Remove subscription from backend
       if (user) {
         await supabase.functions.invoke('push-unsubscribe', {
           body: { userId: user.id }
         });
       }
 
       return { error: null };
     } catch (error: any) {
       return { error: error.message || 'Failed to unsubscribe' };
     } finally {
       setLoading(false);
     }
   }, [subscription, user]);
 
   const sendTestNotification = useCallback(async () => {
     if (permission !== 'granted') {
       return { error: 'Notification permission not granted' };
     }
 
     try {
       const registration = await navigator.serviceWorker.ready;
       await registration.showNotification('Test Notification', {
         body: 'Push notifications are working!',
         icon: '/favicon.ico',
         tag: 'test'
       });
       return { error: null };
     } catch (error: any) {
       return { error: error.message };
     }
   }, [permission]);
 
   return {
     isSupported,
     permission,
     subscription,
     loading,
     subscribe,
     unsubscribe,
     sendTestNotification
   };
 }