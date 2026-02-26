import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wizrexquspydujedouvc.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpenJleHF1c3B5ZHVqZWRvdXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDY4NzEsImV4cCI6MjA3NDIyMjg3MX0.JVZGLHnNB2yzi62cpI4zcdtyjZB7LJS07W5v4j4ghAE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);