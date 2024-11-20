import { createClient } from '@supabase/supabase-js';

const url = "https://xwbpivgttizohzptprdz.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YnBpdmd0dGl6b2h6cHRwcmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NjYxNzYsImV4cCI6MjA0NzA0MjE3Nn0.ho1DsLXA2s75vCz1wQ0JLXlRKuHblCm1oiylsSxZI74";

export const supabase = createClient(url, key);
