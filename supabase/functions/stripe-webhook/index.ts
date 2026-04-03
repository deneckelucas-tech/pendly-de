import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Missing Stripe config" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: String(err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === "active" || sub.status === "trialing" ? "active" : "expired";
        const end = new Date(sub.current_period_end * 1000).toISOString();
        await updateByCustomer(supabase, sub.customer as string, {
          subscription_status: status,
          subscription_end: end,
          stripe_customer_id: sub.customer as string,
        });
        logStep("Subscription updated", { customerId: sub.customer, status });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updateByCustomer(supabase, sub.customer as string, {
          subscription_status: "cancelled",
          subscription_end: null,
        });
        logStep("Subscription cancelled", { customerId: sub.customer });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await updateByCustomer(supabase, invoice.customer as string, {
            subscription_status: "active",
          });
          logStep("Payment succeeded", { customerId: invoice.customer });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await updateByCustomer(supabase, invoice.customer as string, {
            subscription_status: "payment_failed",
          });
          logStep("Payment failed", { customerId: invoice.customer });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    logStep("Processing error", { error: String(err) });
    return new Response(JSON.stringify({ error: "Processing failed" }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});

async function updateByCustomer(
  supabase: any,
  customerId: string,
  updates: Record<string, any>
) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("stripe_customer_id", customerId);

  if (error) {
    logStep("DB update error", { customerId, error: error.message });
    throw error;
  }
}
