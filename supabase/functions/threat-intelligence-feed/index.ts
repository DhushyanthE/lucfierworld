import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ThreatIntelEntry {
  id: string;
  source: string;
  type: string;
  severity: string;
  description: string;
  indicators: string[];
  mitreAttackId?: string;
  mitreAttackName?: string;
  mitreTactic?: string;
  timestamp: string;
  confidence: number;
  tags: string[];
}

// MITRE ATT&CK technique mapping (subset of common techniques)
const MITRE_ATTACK_TECHNIQUES = [
  { id: "T1059", name: "Command and Scripting Interpreter", tactic: "Execution", severity: "high" },
  { id: "T1078", name: "Valid Accounts", tactic: "Persistence", severity: "critical" },
  { id: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access", severity: "critical" },
  { id: "T1566", name: "Phishing", tactic: "Initial Access", severity: "high" },
  { id: "T1071", name: "Application Layer Protocol", tactic: "Command and Control", severity: "medium" },
  { id: "T1486", name: "Data Encrypted for Impact", tactic: "Impact", severity: "critical" },
  { id: "T1053", name: "Scheduled Task/Job", tactic: "Execution", severity: "medium" },
  { id: "T1021", name: "Remote Services", tactic: "Lateral Movement", severity: "high" },
  { id: "T1110", name: "Brute Force", tactic: "Credential Access", severity: "high" },
  { id: "T1562", name: "Impair Defenses", tactic: "Defense Evasion", severity: "critical" },
  { id: "T1027", name: "Obfuscated Files or Information", tactic: "Defense Evasion", severity: "medium" },
  { id: "T1498", name: "Network Denial of Service", tactic: "Impact", severity: "high" },
  { id: "T1046", name: "Network Service Discovery", tactic: "Discovery", severity: "low" },
  { id: "T1048", name: "Exfiltration Over Alternative Protocol", tactic: "Exfiltration", severity: "critical" },
  { id: "T1055", name: "Process Injection", tactic: "Defense Evasion", severity: "high" },
  { id: "T1003", name: "OS Credential Dumping", tactic: "Credential Access", severity: "critical" },
  { id: "T1560", name: "Archive Collected Data", tactic: "Collection", severity: "medium" },
  { id: "T1204", name: "User Execution", tactic: "Execution", severity: "medium" },
  { id: "T1070", name: "Indicator Removal", tactic: "Defense Evasion", severity: "high" },
  { id: "T1543", name: "Create or Modify System Process", tactic: "Persistence", severity: "high" },
];

// Simulated threat intelligence sources
const THREAT_INTEL_SOURCES = [
  { name: "MITRE ATT&CK", reliability: 0.99, type: "framework" },
  { name: "AlienVault OTX", reliability: 0.92, type: "osint" },
  { name: "CISA Advisories", reliability: 0.98, type: "government" },
  { name: "VirusTotal", reliability: 0.95, type: "analysis" },
  { name: "Quantum Firewall Internal", reliability: 0.97, type: "internal" },
];

function generateThreatIntel(): ThreatIntelEntry[] {
  const entries: ThreatIntelEntry[] = [];
  const now = Date.now();

  // Generate MITRE ATT&CK based intelligence
  const selectedTechniques = MITRE_ATTACK_TECHNIQUES
    .sort(() => Math.random() - 0.5)
    .slice(0, 8 + Math.floor(Math.random() * 7));

  for (const technique of selectedTechniques) {
    const source = THREAT_INTEL_SOURCES[Math.floor(Math.random() * THREAT_INTEL_SOURCES.length)];
    const ageHours = Math.floor(Math.random() * 168); // up to 7 days
    
    entries.push({
      id: `ti-${technique.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: source.name,
      type: mapTacticToThreatType(technique.tactic),
      severity: technique.severity,
      description: `${technique.name} (${technique.id}) detected via ${source.name}. Tactic: ${technique.tactic}.`,
      indicators: generateIndicators(technique.tactic),
      mitreAttackId: technique.id,
      mitreAttackName: technique.name,
      mitreTactic: technique.tactic,
      timestamp: new Date(now - ageHours * 3600000).toISOString(),
      confidence: source.reliability * (0.8 + Math.random() * 0.2),
      tags: [technique.tactic.toLowerCase().replace(/\s+/g, '-'), source.type, technique.severity],
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function mapTacticToThreatType(tactic: string): string {
  const mapping: Record<string, string> = {
    "Initial Access": "intrusion",
    "Execution": "malware",
    "Persistence": "apt",
    "Privilege Escalation": "apt",
    "Defense Evasion": "evasion",
    "Credential Access": "credential-theft",
    "Discovery": "reconnaissance",
    "Lateral Movement": "lateral-movement",
    "Collection": "data-theft",
    "Command and Control": "c2",
    "Exfiltration": "data-exfiltration",
    "Impact": "ransomware",
  };
  return mapping[tactic] || "unknown";
}

function generateIndicators(tactic: string): string[] {
  const indicators: string[] = [];
  const ipCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < ipCount; i++) {
    indicators.push(`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
  }
  indicators.push(`${Math.random().toString(36).slice(2, 14)}.${['evil', 'malware', 'c2', 'exfil'][Math.floor(Math.random() * 4)]}.net`);
  indicators.push(`SHA256:${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
  return indicators;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { operation = 'fetch' } = await req.json();
    console.log(`Threat intelligence feed operation: ${operation}`);

    if (operation === 'fetch') {
      const entries = generateThreatIntel();

      // Calculate aggregate stats
      const tacticsBreakdown: Record<string, number> = {};
      const severityBreakdown: Record<string, number> = {};
      const sourceBreakdown: Record<string, number> = {};
      
      for (const entry of entries) {
        tacticsBreakdown[entry.mitreTactic || 'Unknown'] = (tacticsBreakdown[entry.mitreTactic || 'Unknown'] || 0) + 1;
        severityBreakdown[entry.severity] = (severityBreakdown[entry.severity] || 0) + 1;
        sourceBreakdown[entry.source] = (sourceBreakdown[entry.source] || 0) + 1;
      }

      // Generate firewall rules from intelligence
      const firewallRules = entries
        .filter(e => e.severity === 'critical' || e.severity === 'high')
        .map(e => ({
          ruleId: `rule-${e.mitreAttackId}-${Date.now()}`,
          action: 'block',
          source: e.source,
          mitreId: e.mitreAttackId,
          indicators: e.indicators.slice(0, 2),
          confidence: e.confidence,
          autoApplied: e.confidence > 0.9,
        }));

      // Log the fetch event
      await supabase.from('quantum_firewall_logs').insert({
        session_id: `ti-feed-${Date.now()}`,
        event_type: 'threat_intel_fetch',
        success: true,
        metrics: {
          entriesCount: entries.length,
          criticalCount: severityBreakdown['critical'] || 0,
          highCount: severityBreakdown['high'] || 0,
          rulesGenerated: firewallRules.length,
          sources: Object.keys(sourceBreakdown),
        },
      });

      return new Response(JSON.stringify({
        success: true,
        entries,
        stats: { tacticsBreakdown, severityBreakdown, sourceBreakdown },
        firewallRules,
        metadata: {
          totalEntries: entries.length,
          lastUpdated: new Date().toISOString(),
          sources: THREAT_INTEL_SOURCES.map(s => s.name),
          mitreTechniques: MITRE_ATTACK_TECHNIQUES.length,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown operation" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Threat intelligence feed error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
