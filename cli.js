#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
const platformCommand = `npx react-native run-${platform}`;
const envVar = `ENVFILE=${envFileName}`;

console.log(`Attempting to start the app on ${platform}...`);

const appProcess = spawn(platformCommand, [], {
    stdio: 'inherit', // This will make the child's stdio the same as the parent's.
    shell: true, 
    env: {
        ...process.env,
        ENVFILE: envFileName
    }
});

appProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Error starting app with exit code ${code}`);
    }
});
