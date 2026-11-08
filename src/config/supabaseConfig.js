/**
 * =========================================================================
 * WORKSHOP APP CONFIGURATION (SUPABASE + GEMINI AI)
 * =========================================================================
 * 
 * Paste your credentials here so the app works automatically
 * for the workshop owner with ZERO manual setup in the browser!
 * 
 * 1. SUPABASE (Database):
 * • Log in: https://supabase.com/dashboard
 * • Go to: Settings -> API
 * • Copy "Project URL" and "anon public key" (DO NOT use service_role key)
 * 
 * 2. GOOGLE GEMINI AI (Optional Free Tier):
 * • Get a free key: https://aistudio.google.com/app/apikey
 * • Paste below in GEMINI_API_KEY (or use .env file)
 */

export const SUPABASE_CONFIG = {
  // Paste your Project URL here (e.g. 'https://abcdefghijklm.supabase.co')
  SUPABASE_URL: '',

  // Paste your Anon Public Key here (e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6...')
  SUPABASE_ANON_KEY: '',
};

export const AI_CONFIG = {
  // Optional: Paste your free Google Gemini API Key here (e.g. 'AIzaSy...')
  // If left empty, the built-in free workshop AI is used automatically at 0 cost!
  GEMINI_API_KEY: '',
};
