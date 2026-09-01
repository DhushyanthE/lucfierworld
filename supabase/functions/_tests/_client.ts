// Shared test client factory.
//
// The default `createClient` starts a token auto-refresh interval and keeps a
// realtime socket around, which Deno's test sanitizer correctly reports as a
// resource leak. These tests never need session persistence or refresh, so
// disable both and expose an explicit teardown for realtime.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function testClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Closes every channel and the underlying websocket so no handles outlive the test.
 *
 * `removeAllChannels` already disconnects the socket internally, and that path
 * arms a fallback `setTimeout` it never clears once the socket closes first — a
 * realtime-js detail, not something callers can cancel. Waiting past that
 * fallback window lets the timer fire so Deno's sanitizer sees a clean slate.
 */
export async function shutdown(client: SupabaseClient) {
  await client.removeAllChannels();
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
