import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, unknown>;
  session_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
}

function validateEventInput(data: any): { valid: boolean; error?: string; data?: AnalyticsEvent } {
  // Validate event_name
  if (!data.event_name || typeof data.event_name !== 'string') {
    return { valid: false, error: 'event_name is required and must be a string' };
  }
  
  if (data.event_name.length > 255) {
    return { valid: false, error: 'event_name must be less than 255 characters' };
  }

  // Validate optional fields with length limits
  if (data.session_id && (typeof data.session_id !== 'string' || data.session_id.length > 255)) {
    return { valid: false, error: 'session_id must be a string less than 255 characters' };
  }

  if (data.page_url && (typeof data.page_url !== 'string' || data.page_url.length > 2048)) {
    return { valid: false, error: 'page_url must be a string less than 2048 characters' };
  }

  if (data.referrer && (typeof data.referrer !== 'string' || data.referrer.length > 2048)) {
    return { valid: false, error: 'referrer must be a string less than 2048 characters' };
  }

  if (data.user_agent && (typeof data.user_agent !== 'string' || data.user_agent.length > 512)) {
    return { valid: false, error: 'user_agent must be a string less than 512 characters' };
  }

  if (data.device_type && (typeof data.device_type !== 'string' || data.device_type.length > 50)) {
    return { valid: false, error: 'device_type must be a string less than 50 characters' };
  }

  if (data.browser && (typeof data.browser !== 'string' || data.browser.length > 50)) {
    return { valid: false, error: 'browser must be a string less than 50 characters' };
  }

  // Validate event_data is an object
  if (data.event_data && typeof data.event_data !== 'object') {
    return { valid: false, error: 'event_data must be an object' };
  }

  return {
    valid: true,
    data: {
      event_name: data.event_name,
      event_data: data.event_data || {},
      session_id: data.session_id,
      page_url: data.page_url,
      referrer: data.referrer,
      user_agent: data.user_agent,
      device_type: data.device_type,
      browser: data.browser,
    }
  };
}

// Simple rate limiting using in-memory store (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

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

    // Parse and validate input
    const requestData = await req.json();
    const validation = validateEventInput(requestData);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const eventInput = validation.data!;

    // Get user ID from session if authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Rate limiting based on user ID or IP
    const rateLimitIdentifier = user?.id || req.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(rateLimitIdentifier)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    // Insert analytics event
    const { data: eventData, error: eventError } = await supabaseClient
      .from("analytics_events")
      .insert({
        event_name: eventInput.event_name,
        event_data: eventInput.event_data,
        user_id: user?.id || null,
        session_id: eventInput.session_id,
        page_url: eventInput.page_url,
        referrer: eventInput.referrer,
        user_agent: eventInput.user_agent,
        device_type: eventInput.device_type,
        browser: eventInput.browser,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error inserting analytics event:", eventError);
      throw eventError;
    }

    // Update or create session
    if (eventInput.session_id) {
      const { data: existingSession } = await supabaseClient
        .from("analytics_sessions")
        .select("*")
        .eq("session_id", eventInput.session_id)
        .maybeSingle();

      if (existingSession) {
        // Update existing session
        await supabaseClient
          .from("analytics_sessions")
          .update({
            ended_at: new Date().toISOString(),
            page_views: existingSession.page_views + 1,
            exit_page: eventInput.page_url,
          })
          .eq("session_id", eventInput.session_id);
      } else {
        // Create new session
        await supabaseClient.from("analytics_sessions").insert({
          session_id: eventInput.session_id,
          user_id: user?.id || null,
          entry_page: eventInput.page_url,
          device_type: eventInput.device_type,
          browser: eventInput.browser,
        });
      }
    }

    console.log("Analytics event tracked:", eventInput.event_name);

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
