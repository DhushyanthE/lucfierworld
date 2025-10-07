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
    // Create client with service role to check admin status
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!userRole;

    // Create client with user's auth for RLS-compliant queries
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const url = new URL(req.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const eventName = url.searchParams.get("event_name");
    const targetUserId = url.searchParams.get("user_id");

    // Non-admins can only query their own data
    const queryUserId = isAdmin && targetUserId ? targetUserId : user.id;

    // Build query for events - RLS will automatically filter to user's own data
    let eventsQuery = supabaseClient
      .from("analytics_events")
      .select("*")
      .eq("user_id", queryUserId)
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

    // Get sessions - RLS will automatically filter
    let sessionsQuery = supabaseClient
      .from("analytics_sessions")
      .select("*")
      .eq("user_id", queryUserId)
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

    // Use the safe analytics summary function
    const { data: summary, error: summaryError } = await supabaseClient.rpc(
      "get_user_analytics_summary",
      { target_user_id: queryUserId }
    );

    if (summaryError) {
      console.error("Error fetching summary:", summaryError);
    }

    console.log(`Analytics retrieved for ${isAdmin ? "admin viewing user" : "user"}: ${queryUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events,
          sessions,
          summary: summary?.[0] || { total_events: 0, total_sessions: 0, unique_pages: 0 },
          is_admin: isAdmin,
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
