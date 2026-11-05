import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { Loader2 } from "lucide-react";

// Landing point for email-confirmation links that must return to an OAuth
// consent flow: /auth/callback?next=<validated consent URL>.
export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const next = oauthReturnPath(params.get("next"));
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        clearInterval(timer);
        window.location.assign(next);
      } else if (attempts > 16) {
        clearInterval(timer);
        setError("Sign-in could not be completed. Return to the app and sign in again.");
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm p-6 text-center space-y-3">
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : (
          <>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Completing sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
