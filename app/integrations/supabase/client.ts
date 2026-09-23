import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://fdjoibawiqjspvrclidg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkam9pYmF3aXFqc3B2cmNsaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMjYxMTYsImV4cCI6MjEwNTcwMjExNn0.fOBc9NRCqnDbfTzEzrRK-5qqek08lZHjj1v0jpkWZZQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
