import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Password reset request for:", email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Generate password reset link using Supabase Auth
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectUrl || `${supabaseUrl.replace('.supabase.co', '')}/auth`,
      },
    });

    if (error) {
      console.error("Error generating reset link:", error);
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset email will be sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetLink = data.properties?.action_link;

    if (!resetLink) {
      console.error("No reset link generated");
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset email will be sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send beautiful password reset email
    const { error: emailError } = await resend.emails.send({
      from: "Quantum Blockchain <noreply@resend.dev>",
      to: [email],
      subject: "🔐 Reset Your Password - Quantum Blockchain",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              background-color: #0f0f23; 
              color: #fff; 
              margin: 0; 
              padding: 0; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 40px 20px; 
            }
            .card { 
              background: linear-gradient(135deg, #1a1a3e 0%, #2d1f4d 100%); 
              border-radius: 16px; 
              padding: 40px; 
              border: 1px solid rgba(139, 92, 246, 0.3); 
            }
            .logo { 
              text-align: center; 
              margin-bottom: 24px; 
            }
            .icon { 
              font-size: 48px; 
              margin-bottom: 16px; 
            }
            h1 { 
              margin: 0 0 16px 0; 
              font-size: 24px; 
              color: #fff; 
              text-align: center; 
            }
            p { 
              color: #d1d5db; 
              line-height: 1.6; 
              margin: 0 0 24px 0; 
              text-align: center; 
            }
            .button-container { 
              text-align: center; 
              margin: 32px 0; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: #fff !important; 
              text-decoration: none; 
              padding: 16px 40px; 
              border-radius: 12px; 
              font-weight: 600; 
              font-size: 16px; 
            }
            .divider { 
              border: none; 
              border-top: 1px solid rgba(139, 92, 246, 0.2); 
              margin: 32px 0; 
            }
            .note { 
              background: rgba(0, 0, 0, 0.3); 
              border-radius: 12px; 
              padding: 16px; 
              margin-top: 24px; 
            }
            .note p { 
              color: #9ca3af; 
              font-size: 14px; 
              margin: 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 32px; 
              color: #6b7280; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <div class="icon">🔐</div>
                <h1>Password Reset Request</h1>
              </div>
              
              <p>
                We received a request to reset your password for your Quantum Blockchain account.
                Click the button below to create a new password.
              </p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <hr class="divider">
              
              <div class="note">
                <p>
                  ⏰ This link will expire in 1 hour.<br><br>
                  🔒 If you didn't request this password reset, you can safely ignore this email. 
                  Your password will remain unchanged.
                </p>
              </div>
              
              <div class="footer">
                <p>© 2024 Quantum Blockchain. Secured with quantum-resistant cryptography.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      // Still return success to not reveal if email exists
    } else {
      console.log("Password reset email sent successfully to:", email);
    }

    return new Response(
      JSON.stringify({ success: true, message: "If an account exists, a reset email will be sent." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
