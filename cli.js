#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
const platformCommand = `ENVFILE=${envFileName} npx react-native run-${platform}`;

console.log(`Attempting to start the app on ${platform}...`);

// This will directly execute the command and keep it running in the terminal.
execSync(platformCommand, { stdio: 'inherit' });
