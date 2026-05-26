import {
  createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  "https://zzcizpnzamyfqmqzxasi.supabase.co";

const supabaseAnonKey =
  "sb_publishable_fWghn_iYnVBgKKcLAnf8Qw_BnVqvmUw";

const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );

export default supabase;
