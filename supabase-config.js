// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://sulynrujrxglzyelrwff.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bHlucnVqcnhnbHp5ZWxyd2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2ODIzMjAsImV4cCI6MjA2NzI1ODMyMH0.Sebf3aY8P4JVa_paiHnP3nqJ2VYrBMXz4sx35WEDlzE'
};

// Initialize Supabase client with persistence settings
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
        // Enable persistent sessions that survive browser refresh
        persistSession: true,
        // Store session in localStorage (survives browser refresh)
        storage: window.localStorage,
        // Automatically refresh tokens
        autoRefreshToken: true,
        // Detect session from URL on page load
        detectSessionInUrl: true,
        // Extend session duration (24 hours)
        flowType: 'pkce'
    }
});

// Export for use in other files
window.supabaseClient = supabaseClient;
