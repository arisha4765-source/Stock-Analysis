import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zzcizpnzamyfqmqzxasi.supabase.co";
const supabaseKey = "sb_publishable_fWghn_iYnVBgKKcLAnf8Qw_BnVqvmUw";

export const supabase = createClient(supabaseUrl, supabaseKey);
