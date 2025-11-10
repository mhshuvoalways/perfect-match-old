import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uypctyroipdzfflwstze.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cGN0eXJvaXBkemZmbHdzdHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDYxNTEsImV4cCI6MjA2NjUyMjE1MX0.5UiTMDwZbRv_nSz3KUs4fCteqFHl_EZj5LtHLs4-myI";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
