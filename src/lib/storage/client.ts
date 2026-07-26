// Supabase Storage admin client — server-only (holds SUPABASE_SERVICE_ROLE_KEY).
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var — see .env.example"
  );
}

const bucket = process.env.SUPABASE_STORAGE_BUCKET;

if (!bucket) {
  throw new Error("Missing SUPABASE_STORAGE_BUCKET env var — see .env.example");
}

export const storageBucket = bucket;

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin?: ReturnType<typeof createClient>;
};

export const supabaseAdmin =
  globalForSupabase.supabaseAdmin ??
  createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseAdmin = supabaseAdmin;
}
