
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
        if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY') supabaseKey = value;
    }
});

const url = `${supabaseUrl}/auth/v1/signup`;
const email = 'winnerorganaadmin@gmail.com';
const password = 'Admin123$Winner2026';

console.log('Target URL:', url);
console.log('Email:', email);

async function run() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                email: email,
                password: password,
                data: {
                    full_name: 'Admin User'
                }
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

run();
