 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
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