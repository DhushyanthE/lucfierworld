 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 // Simple JWT signing for VAPID
 async function signJwt(payload: object, privateKeyBase64: string): Promise<string> {
   const header = { alg: 'ES256', typ: 'JWT' };
   
   const base64UrlEncode = (data: string) => 
     btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
   
   const encodedHeader = base64UrlEncode(JSON.stringify(header));
   const encodedPayload = base64UrlEncode(JSON.stringify(payload));
   const signingInput = `${encodedHeader}.${encodedPayload}`;
   
   // Import private key
   const privateKeyBytes = Uint8Array.from(atob(privateKeyBase64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
   
   const privateKey = await crypto.subtle.importKey(
     'raw',
     privateKeyBytes,
     { name: 'ECDSA', namedCurve: 'P-256' },
     false,
     ['sign']
   );
   
   const signature = await crypto.subtle.sign(
     { name: 'ECDSA', hash: 'SHA-256' },
     privateKey,
     new TextEncoder().encode(signingInput)
   );
   
   const signatureBase64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
   
   return `${signingInput}.${signatureBase64}`;
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const authHeader = req.headers.get('Authorization');
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: 'Missing authorization header' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const supabaseAuth = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_ANON_KEY')!,
       { global: { headers: { Authorization: authHeader } } }
     );
 
     const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
     if (authError || !user) {
       return new Response(
         JSON.stringify({ error: 'Unauthorized' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const { userId, title, body, url, icon } = await req.json();
     
     if (!userId || !title) {
       return new Response(
         JSON.stringify({ error: 'Missing required fields: userId, title' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
     const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
     
     if (!vapidPrivateKey || !vapidPublicKey) {
       console.error('VAPID keys not configured');
       return new Response(
         JSON.stringify({ error: 'Push notifications not configured' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const supabaseAdmin = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
     );
 
     // Get user's push subscription
     const { data: profile, error: profileError } = await supabaseAdmin
       .from('profiles')
       .select('push_subscription')
       .eq('user_id', userId)
       .single();
 
     if (profileError || !profile?.push_subscription) {
       console.log(`No push subscription found for user ${userId}`);
       return new Response(
         JSON.stringify({ error: 'User has no push subscription' }),
         { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const subscription = profile.push_subscription;
     console.log(`Sending push notification to user ${userId}`);
 
     // Create notification payload
     const payload = JSON.stringify({
       title,
       body: body || '',
       url: url || '/',
       icon: icon || '/favicon.ico'
     });
 
     // Send push notification
     const endpoint = subscription.endpoint;
     const p256dh = subscription.keys.p256dh;
     const auth = subscription.keys.auth;
 
     // Create VAPID JWT
     const audience = new URL(endpoint).origin;
     const vapidJwt = await signJwt({
       aud: audience,
       exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
       sub: 'mailto:noreply@quantumblockchain.app'
     }, vapidPrivateKey);
 
     const response = await fetch(endpoint, {
       method: 'POST',
       headers: {
         'Authorization': `vapid t=${vapidJwt}, k=${vapidPublicKey}`,
         'Content-Type': 'application/octet-stream',
         'Content-Encoding': 'aes128gcm',
         'TTL': '86400'
       },
       body: payload
     });
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error(`Push notification failed: ${response.status} ${errorText}`);
       
       // If subscription expired, remove it
       if (response.status === 410) {
         await supabaseAdmin
           .from('profiles')
           .update({ push_subscription: null })
           .eq('user_id', userId);
       }
       
       return new Response(
         JSON.stringify({ error: 'Failed to send push notification' }),
         { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Push notification sent successfully to user ${userId}`);
 
     return new Response(
       JSON.stringify({ success: true }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   } catch (error) {
     console.error('Send push notification error:', error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });