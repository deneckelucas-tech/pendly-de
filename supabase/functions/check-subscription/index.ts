import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check trial status from profiles
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("trial_start, subscription_status")
      .eq("user_id", user.id)
      .single();

    const trialStart = profile?.trial_start ? new Date(profile.trial_start) : new Date();
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const trialActive = now < trialEnd;

    logStep("Trial check", { trialStart, trialEnd, trialActive });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      
      // Update profile status
      const status = trialActive ? "trialing" : "expired";
      await supabaseClient
        .from("profiles")
        .update({ subscription_status: status })
        .eq("user_id", user.id);

      return new Response(JSON.stringify({
        subscribed: trialActive,
        status,
        trial_end: trialEnd.toISOString(),
        trial_days_remaining: trialActive ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check trialing subscriptions
    const trialingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    const activeSub = subscriptions.data[0] || trialingSubs.data[0];
    const hasActiveSub = !!activeSub;

    let subscriptionEnd = null;
    let productId = null;

    if (hasActiveSub) {
      subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
      productId = activeSub.items.data[0].price.product;
      logStep("Active subscription found", { subscriptionId: activeSub.id });
    }

    // Update profile
    const newStatus = hasActiveSub ? "active" : (trialActive ? "trialing" : "expired");
    await supabaseClient
      .from("profiles")
      .update({
        subscription_status: newStatus,
        subscription_end: subscriptionEnd,
        stripe_customer_id: customerId,
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      subscribed: hasActiveSub || trialActive,
      status: newStatus,
      product_id: productId,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd.toISOString(),
      trial_days_remaining: trialActive ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
