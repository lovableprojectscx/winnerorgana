import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (last 5 chars):', supabaseKey.slice(-5));


const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'contact@winnerorgana.com';
    const password = 'Admin123$Winner2026';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Admin User',
            }
        }
    });

    if (error) {
        console.error('Error creating user:', JSON.stringify(error, null, 2));
        if (error.message.includes('already registered')) {
            // Try to signIn to get the ID if already exists
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInData && signInData.user) {
                console.log('User already exists. ID:', signInData.user.id);
                return;
            } else {
                console.error('Could not sign in with existing user:', signInError?.message);
            }
        }
        process.exit(1);
    }

    if (data.user) {
        console.log('User created successfully!');
        console.log('USER_ID:', data.user.id);
    } else {
        // Sometimes signUp returns null user if email confirmation is required, 
        // but in local/dev supabase usually auto-confirms or we can just check.
        // However, if we are producing a valid user execution, it usually returns it.
        console.error('User creation failed, no user returned. Check if email confirmation is required.');
        process.exit(1);
    }
}

createAdmin();
