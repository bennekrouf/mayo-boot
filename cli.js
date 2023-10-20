#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

// Determine the platform to run based on the OS or the provided platform argument. 
// For macOS (darwin) without any platform argument, it'll default to iOS.
// If a platform argument is provided, it'll be used.
const platformCommand = platformArg === 'android'
    ? `ENVFILE=${envFileName} npx react-native run-android`
    : (platformArg === 'ios' || os.platform() === 'darwin')
    ? `ENVFILE=${envFileName} npx react-native run-ios`
    : `ENVFILE=${envFileName} npx react-native run-android`;

console.log(`Attempting to start the app on ${platformArg || (os.platform() === 'darwin' ? 'iOS' : 'Android')}...`);

const appProcess = exec(platformCommand);

appProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
});

appProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
});

appProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Error starting app with exit code ${code}`);
    }
});
