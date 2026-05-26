import { createClient }
from "@supabase/supabase-js";

const supabase =
  createClient(
    "YOUR_URL",
    "YOUR_ANON_KEY"
  );

export default supabase;
