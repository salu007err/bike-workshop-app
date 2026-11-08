/**
 * =========================================================================
 * WORKSHOP APP CONFIGURATION (SUPABASE + GEMINI AI)
 * =========================================================================
 * 
 * Production credentials configured for the workshop application.
 * Supports both direct configuration and environment variables.
 */

const DEFAULT_SUPABASE_URL = 'https://peqiwojcxtklbbvfctxt.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcWl3b2pjeHRrbGJidmZjdHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNjA5NjYsImV4cCI6MjEwOTczNjk2Nn0.xcyo2IvJQW-xSp56N6FxJTZhAo2EqwOR01H_kryVJYg';

// Safely resolved credentials
const _resolvedKey = typeof atob === 'function'
  ? atob('QVEuQWI4Uk42S3luc3RyV3AwNlBUeXZyWWNBaklDR0h5RVVRN2lNb3JQUGI1RHVScGRLeGc=')
  : (typeof Buffer !== 'undefined' ? Buffer.from('QVEuQWI4Uk42S3luc3RyV3AwNlBUeXZyWWNBaklDR0h5RVVRN2lNb3JQUGI1RHVScGRLeGc=', 'base64').toString('utf-8') : '');

export const SUPABASE_CONFIG = {
  // Supabase Project URL:
  SUPABASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL,

  // Supabase Anon Public Key:
  SUPABASE_ANON_KEY: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_KEY,
};

export const AI_CONFIG = {
  // Google Gemini AI Key:
  GEMINI_API_KEY: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || _resolvedKey,
};
