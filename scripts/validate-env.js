#!/usr/bin/env node
// validate-env.js - Checks for required environment variables for 6ol Core

const required = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'VAULT_PUSH_TOKEN'
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
}
