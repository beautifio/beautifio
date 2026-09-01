import { createBrowserClient } from "@supabase/ssr";

// Proxy Client: Arahkan Supabase SDK ke endpoint API mandiri kita di VPS
const supabaseUrl = "https://api.beautifio.com"; // API Traefik kita
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
