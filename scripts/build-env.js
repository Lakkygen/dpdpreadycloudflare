import fs from 'fs';

const envContent = `
VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL || ''}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY || ''}
VITE_API_URL=${process.env.VITE_API_URL || '/api'}
VITE_CLIENT_URL=${process.env.VITE_CLIENT_URL || ''}
`;

fs.writeFileSync('.env', envContent.trim());
console.log('[build-env] Created .env file with VITE_ variables');
