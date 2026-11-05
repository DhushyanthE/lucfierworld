import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OAUTH_RETURN_STORAGE_KEY, oauthReturnPath } from "@/lib/oauth-return-path";
import { Shield, Loader2, Check, X } from "lucide-react";

interface ConsentDetails {
  client?: { name?: string; redirect_uri?: string; redirect_uris?: string[] };
  scopes?: string | string[];
}

const SCOPE_LABELS: Record<string, string> = {
  openid: "Verify your identity",
  email: "Share your email address",
  profile: "Share your basic profile",
};

export default function OAuthConsent() {
  const authorizationId = new URL(window.location.href).searchParams.get("authorization_id") ?? "";
  const [details, setDetails] = useState<ConsentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const consentUrl = window.location.pathname + window.location.search;
        sessionStorage.setItem(OAUTH_RETURN_STORAGE_KEY, consentUrl);
        window.location.href = "/#/auth?next=" + encodeURIComponent(consentUrl);
        return;
      }
      setAccount(session.user.email ?? session.user.id);
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = (data as ConsentDetails & { redirect_url?: string; redirect_to?: string })?.redirect_url
        ?? (data as ConsentDetails & { redirect_to?: string })?.redirect_to;
      if (immediate && !(data as ConsentDetails)?.client) { window.location.href = immediate; return; }
      setDetails(data as ConsentDetails);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect returned by the authorization server."); }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";
  const clientUri = details?.client?.redirect_uri ?? details?.client?.redirect_uris?.[0] ?? "";
  const rawScopes = Array.isArray(details?.scopes)
    ? details.scopes.join(" ")
    : (details?.scopes ?? "openid email profile");
  const scopeList = rawScopes.split(/[\s,]+/).filter(Boolean);
  const known = scopeList.filter(s => SCOPE_LABELS[s]);
  const unknown = scopeList.filter(s => !SCOPE_LABELS[s]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm p-6 space-y-5">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>

        {error && (
          <div className="space-y-3 text-center">
            <h1 className="text-lg font-semibold">Could not complete this connection</h1>
            <p className="text-sm text-muted-foreground break-words">{error}</p>
            <p className="text-xs text-muted-foreground">Return to the app that started this request and try again.</p>
          </div>
        )}

        {!error && !details && (
          <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading connection request…</p>
          </div>
        )}

        {!error && details && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-lg font-semibold">Connect {clientName} to lucfierworld</h1>
              <p className="text-sm text-muted-foreground">
                This lets {clientName} use this app's enabled tools while you are signed in.
              </p>
            </div>

            {account && (
              <div className="text-sm border border-border rounded-md p-3">
                <span className="text-muted-foreground">Signed in as </span>
                <span className="font-medium break-all">{account}</span>
              </div>
            )}

            {clientUri && (
              <div className="text-sm border border-border rounded-md p-3 space-y-1">
                <span className="text-muted-foreground block">Connected app</span>
                <span className="font-medium break-all">{clientName}</span>
                <span className="block text-xs text-muted-foreground break-all">{clientUri}</span>
              </div>
            )}

            <div className="text-sm space-y-1">
              <span className="text-muted-foreground block">This will share</span>
              <ul className="space-y-1">
                {known.map(s => <li key={s} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{SCOPE_LABELS[s]}</li>)}
                {unknown.map(s => <li key={s} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Additional permission requested: {s}</li>)}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              This does not bypass this app's permissions or backend policies.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => decide(true)}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Approve
              </button>
              <button
                onClick={() => decide(false)}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel connection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { oauthReturnPath };
