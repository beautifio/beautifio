import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // 1. Check the actual error when querying familia_merchants
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    results.user = { id: user?.id, email: user?.email, is_anonymous: user?.is_anonymous };
    results.anonKeyUsed = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + "...";
    results.hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. Try querying familia_merchants
    const merchantQuery = await supabase
      .from("familia_merchants")
      .select("id, name")
      .limit(1);

    results.merchantQueryError = merchantQuery.error;
    results.merchantQueryData = merchantQuery.data;

    // 3. Try querying a different RLS table for comparison
    const dealQuery = await supabase
      .from("familia_affiliate_deals")
      .select("id, title")
      .limit(1);

    results.dealQueryError = dealQuery.error;

    // 4. Try querying pg_policies via rpc
    const { data: policies, error: policiesError } = await supabase.rpc("get_merchant_policies");
    results.policiesViaRpc = policies;
    results.policiesViaRpcError = policiesError;

    // 5. Check users table RLS policies
    const { data: userPolicies, error: userPoliciesError } = await supabase.rpc("get_user_policies");
    results.userPolicies = userPolicies;
    results.userPoliciesError = userPoliciesError;

    // 6. Try to get createClient params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    results.supabaseUrl = supabaseUrl;

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: String(error), results });
  }
}
