import { createClient } from "npm:@supabase/supabase-js@2";
import { correlationId } from "../_shared/backend-contracts.ts";
import { integrationRegistry } from "../_shared/integration-registry.ts";
import { analyzeTelemetry, auditHash, type Telemetry } from "../_shared/defense.ts";
import { reviewDefensiveFinding } from "../_shared/defense-review.ts";

const headers = {
  "Access-Control-Allow-Origin": Deno.env.get("DEFENSE_ALLOWED_ORIGIN") || "http://localhost:8080",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const valid=(x:any):x is Telemetry => x && typeof x.source==="string" && x.source.length>0 && x.source.length<=128 &&
 Number.isSafeInteger(x.failed_auth)&&x.failed_auth>=0&&x.failed_auth<=100000 &&
 Number.isSafeInteger(x.new_processes)&&x.new_processes>=0&&x.new_processes<=100000 &&
 Number.isFinite(x.outbound_spike)&&x.outbound_spike>=0&&x.outbound_spike<=1 &&
 Number.isFinite(x.file_entropy)&&x.file_entropy>=0&&x.file_entropy<=1 &&
 typeof x.privilege_change==="boolean"&&typeof x.known_ioc_match==="boolean";

async function authenticate(req:Request){
 const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_ANON_KEY"), token=req.headers.get("authorization");
 if(!url||!key||!token?.startsWith("Bearer ")) return null;
 const sb=createClient(url,key,{global:{headers:{Authorization:token}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await sb.auth.getUser(token.slice(7));
 return error?null:data.user;
}

Deno.serve(async req=>{
 if(req.method==="OPTIONS") return new Response(null,{headers});
 const user=await authenticate(req);
 if(!user) return reply({error:"authentication required"},401);
 const url=new URL(req.url);
 if(req.method==="GET" && url.pathname.endsWith("/health")) {
   return reply({service:"QuantumSynapse Integration Gateway",status:"ok",technologies:integrationRegistry(),
     boundaries:{autonomous_action:false,weapon_control:false,human_approval_required:true}});
 }
 if(req.method!=="POST") return reply({error:"use GET /health or POST /defense/analyze"},405);
 if(!url.pathname.endsWith("/defense/analyze")) return reply({error:"unknown route"},404);
 const body=await req.json().catch(()=>null);
 if(!valid(body)) return reply({error:"invalid telemetry"},400);
 const finding=analyzeTelemetry(body);
 const review=reviewDefensiveFinding(finding,body);
 const prev=typeof body.previous_audit_hash==="string"&&/^[0-9a-f]{128}$/.test(body.previous_audit_hash)?body.previous_audit_hash:"0".repeat(128);
 return reply({
   envelope:{version:"qs-defense/1",correlation_id:correlationId(body.source),received_at:new Date().toISOString(),source:body.source},
   pipeline:["authenticated-gateway","sentinel-triage","sha3-512","ml-dsa-87","policy-review","human-command-gate","audit-link"],
   finding,review,audit:{previous_hash:prev,audit_hash:auditHash(prev,finding),persistence:"session-local-untrusted"},
   execution:{autonomous_action:false,human_approval_required:true,executed:false}
 });
});
