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

    // Parse query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "overview";
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    let responseData: any = {};

    switch (type) {
      case "overview": {
        // Get total events count
        const { count: totalEvents } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true });

        // Get unique sessions
        const { count: uniqueSessions } = await supabase
          .from("analytics_sessions")
          .select("*", { count: "exact", head: true });

        // Get unique users
        const { data: userData } = await supabase
          .from("analytics_events")
          .select("user_id");
        const uniqueUsers = new Set(
          userData?.filter((e) => e.user_id).map((e) => e.user_id)
        ).size;

        // Get recent events
        const { data: recentEvents } = await supabase
          .from("analytics_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Get top events
        const { data: topEvents } = await supabase
          .from("analytics_events")
          .select("event_name");
        
        const eventCounts: Record<string, number> = {};
        topEvents?.forEach((event) => {
          eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
        });

        const topEventsList = Object.entries(eventCounts)
          .map(([name, count]) => ({ event_name: name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        responseData = {
          total_events: totalEvents || 0,
          unique_sessions: uniqueSessions || 0,
          unique_users: uniqueUsers,
          recent_events: recentEvents,
          top_events: topEventsList,
        };
        break;
      }

      case "events": {
        let query = supabase
          .from("analytics_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (startDate) {
          query = query.gte("created_at", startDate);
        }
        if (endDate) {
          query = query.lte("created_at", endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        responseData = { events: data };
        break;
      }

      case "sessions": {
        let query = supabase
          .from("analytics_sessions")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(limit);

        if (startDate) {
          query = query.gte("started_at", startDate);
        }
        if (endDate) {
          query = query.lte("started_at", endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        responseData = { sessions: data };
        break;
      }

      case "daily": {
        // Refresh the materialized view
        await supabase.rpc("refresh_analytics_summary");

        // Get daily summary
        let query = supabase
          .from("analytics_daily_summary")
          .select("*")
          .order("date", { ascending: false })
          .limit(limit);

        if (startDate) {
          query = query.gte("date", startDate);
        }
        if (endDate) {
          query = query.lte("date", endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        responseData = { daily_stats: data };
        break;
      }

      case "realtime": {
        // Get events from last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data: realtimeEvents } = await supabase
          .from("analytics_events")
          .select("*")
          .gte("created_at", fiveMinutesAgo)
          .order("created_at", { ascending: false });

        const { data: activeSessions } = await supabase
          .from("analytics_sessions")
          .select("*")
          .gte("started_at", fiveMinutesAgo)
          .is("ended_at", null);

        responseData = {
          realtime_events: realtimeEvents,
          active_sessions: activeSessions,
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid type parameter" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    console.log("Analytics data retrieved:", type);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-analytics function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
