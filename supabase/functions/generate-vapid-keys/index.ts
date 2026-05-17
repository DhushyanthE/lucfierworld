 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 // Generate VAPID key pair using Web Crypto API
 async function generateVapidKeys() {
   const keyPair = await crypto.subtle.generateKey(
     {
       name: "ECDSA",
       namedCurve: "P-256"
     },
     true,
     ["sign", "verify"]
   );
 
   // Export public key
   const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
   const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
     .replace(/\+/g, '-')
     .replace(/\//g, '_')
     .replace(/=+$/, '');
 
   // Export private key
   const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
   const privateKeyBase64 = privateKeyJwk.d || '';
 
   return {
     publicKey: publicKeyBase64,
     privateKey: privateKeyBase64
   };
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     // Admin-only setup utility
     const authHeader = req.headers.get('Authorization');
     if (!authHeader?.startsWith('Bearer ')) {
       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
         status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
     const supabaseAuth = createClient(
       supabaseUrl,
       Deno.env.get('SUPABASE_ANON_KEY')!,
       { global: { headers: { Authorization: authHeader } } }
     );
     const { data: claims, error: authErr } = await supabaseAuth.auth.getClaims(authHeader.replace('Bearer ', ''));
     if (authErr || !claims?.claims?.sub) {
       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
         status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
     const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
     const { data: roleRow } = await supabaseAdmin
       .from('user_roles').select('role').eq('user_id', claims.claims.sub).eq('role', 'admin').maybeSingle();
     if (!roleRow) {
       return new Response(JSON.stringify({ error: 'Forbidden' }), {
         status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }

     console.log("Generating VAPID keys...");

     const keys = await generateVapidKeys();
     
     console.log("VAPID keys generated successfully");
     console.log("Public Key (add to VITE_VAPID_PUBLIC_KEY):", keys.publicKey);
     console.log("Private Key (add to VAPID_PRIVATE_KEY secret):", keys.privateKey);
     
     return new Response(
       JSON.stringify({
         success: true,
         publicKey: keys.publicKey,
         privateKey: keys.privateKey,
         instructions: {
           step1: "Add the publicKey as VITE_VAPID_PUBLIC_KEY in your environment",
           step2: "Add the privateKey as VAPID_PRIVATE_KEY secret in Lovable Cloud"
         }
       }),
       { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200 
       }
     );
   } catch (error) {
     console.error("Error generating VAPID keys:", error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 500 
       }
     );
   }
 });