import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: "ok" | "error"; latency?: number; error?: string }> = {};

  // Check Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      checks.supabase = { status: "error", error: "Missing credentials" };
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const dbStart = Date.now();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const dbLatency = Date.now() - dbStart;

      if (error) {
        checks.supabase = { status: "error", error: error.message, latency: dbLatency };
      } else {
        checks.supabase = { status: "ok", latency: dbLatency };
      }
    }
  } catch (error) {
    checks.supabase = { status: "error", error: String(error) };
  }

  // Check Stripe configuration
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      checks.stripe = { status: "error", error: "Missing API key" };
    } else {
      checks.stripe = { status: "ok" };
    }
  } catch (error) {
    checks.stripe = { status: "error", error: String(error) };
  }

  // Check environment
  checks.environment = {
    status: "ok",
  };

  // Calculate overall status
  const allOk = Object.values(checks).every((check) => check.status === "ok");
  const totalLatency = Date.now() - startTime;

  const response = {
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    latency: totalLatency,
    version: process.env.npm_package_version || "1.0.0",
    checks,
  };

  return NextResponse.json(response, {
    status: allOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
