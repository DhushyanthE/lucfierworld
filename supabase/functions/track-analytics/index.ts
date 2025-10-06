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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      event_name,
      event_data = {},
      session_id,
      page_url,
      referrer,
      user_agent,
      device_type,
      browser,
      country,
      city,
    } = await req.json();

    // Validate required fields
    if (!event_name || !session_id) {
      return new Response(
        JSON.stringify({ error: "event_name and session_id are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user ID from auth if available
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      userId = user?.id || null;
    }

    // Extract IP address from request
    const ip_address = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                       req.headers.get("x-real-ip") || 
                       null;

    // Insert analytics event
    const { data: eventData, error: eventError } = await supabase
      .from("analytics_events")
      .insert({
        event_name,
        event_data,
        user_id: userId,
        session_id,
        page_url,
        referrer,
        user_agent,
        ip_address,
        country,
        city,
        device_type,
        browser,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error inserting event:", eventError);
      return new Response(JSON.stringify({ error: eventError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update or create session
    if (event_name === "page_view") {
      const { data: existingSession } = await supabase
        .from("analytics_sessions")
        .select()
        .eq("session_id", session_id)
        .single();

      if (existingSession) {
        // Update existing session
        await supabase
          .from("analytics_sessions")
          .update({
            page_views: (existingSession.page_views || 0) + 1,
            exit_page: page_url,
            ended_at: new Date().toISOString(),
          })
          .eq("session_id", session_id);
      } else {
        // Create new session
        await supabase.from("analytics_sessions").insert({
          session_id,
          user_id: userId,
          entry_page: page_url,
          exit_page: page_url,
          page_views: 1,
          device_type,
          browser,
          country,
        });
      }
    }

    console.log("Analytics event tracked:", event_name, session_id);

    return new Response(
      JSON.stringify({ success: true, event: eventData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in track-analytics function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
