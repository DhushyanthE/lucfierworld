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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const eventName = url.searchParams.get("event_name");

    // Build query for events
    let eventsQuery = supabaseClient
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate) {
      eventsQuery = eventsQuery.gte("created_at", startDate);
    }
    if (endDate) {
      eventsQuery = eventsQuery.lte("created_at", endDate);
    }
    if (eventName) {
      eventsQuery = eventsQuery.eq("event_name", eventName);
    }

    const { data: events, error: eventsError } = await eventsQuery.limit(1000);

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    // Get sessions
    let sessionsQuery = supabaseClient
      .from("analytics_sessions")
      .select("*")
      .order("started_at", { ascending: false });

    if (startDate) {
      sessionsQuery = sessionsQuery.gte("started_at", startDate);
    }
    if (endDate) {
      sessionsQuery = sessionsQuery.lte("started_at", endDate);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery.limit(1000);

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      throw sessionsError;
    }

    // Get summary statistics
    const { data: dailySummary, error: summaryError } = await supabaseClient
      .from("analytics_daily_summary")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    console.log("Analytics retrieved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events,
          sessions,
          daily_summary: dailySummary || [],
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-analytics function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message === "Unauthorized" ? 401 : 500,
      }
    );
  }
});
