import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing from environment variables.");
}

// Node.js < 22 (used by Vite SSR dev server) has no native WebSocket.
// import.meta.env.SSR is true only during SSR; Vite removes this entire block
// from the browser bundle so `ws` is never shipped to the client.
let realtimeOptions: Record<string, unknown> = {};
if (import.meta.env.SSR && typeof globalThis.WebSocket === 'undefined') {
  const wsModule = await import('ws');
  const wsImpl = (wsModule as any).WebSocket ?? (wsModule as any).default;
  realtimeOptions = { transport: wsImpl };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: realtimeOptions as any,
});
