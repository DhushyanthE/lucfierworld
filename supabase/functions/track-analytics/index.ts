import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      event_name,
      event_data = {},
      session_id,
      page_url,
      referrer,
      user_agent,
      device_type,
      browser,
    } = await req.json();

    // Get user ID from session if authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Insert analytics event
    const { data: eventData, error: eventError } = await supabaseClient
      .from("analytics_events")
      .insert({
        event_name,
        event_data,
        user_id: user?.id || null,
        session_id,
        page_url,
        referrer,
        user_agent,
        device_type,
        browser,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error inserting analytics event:", eventError);
      throw eventError;
    }

    // Update or create session
    if (session_id) {
      const { data: existingSession } = await supabaseClient
        .from("analytics_sessions")
        .select("*")
        .eq("session_id", session_id)
        .maybeSingle();

      if (existingSession) {
        // Update existing session
        await supabaseClient
          .from("analytics_sessions")
          .update({
            ended_at: new Date().toISOString(),
            page_views: existingSession.page_views + 1,
            exit_page: page_url,
          })
          .eq("session_id", session_id);
      } else {
        // Create new session
        await supabaseClient.from("analytics_sessions").insert({
          session_id,
          user_id: user?.id || null,
          entry_page: page_url,
          device_type,
          browser,
        });
      }
    }

    console.log("Analytics event tracked:", event_name);

    return new Response(JSON.stringify({ success: true, data: eventData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in track-analytics function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
