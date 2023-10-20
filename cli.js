#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

const environment = process.argv[2] || 'local';
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

const startCommand = `ENVFILE=${envFileName} yarn start`;

console.log('Attempting to start Metro bundler...');

exec(startCommand, (error) => {
    if (error) {
        console.error(`Error starting Metro bundler: ${error}`);
        return;
    }

    console.log('Metro bundler started!');

    const platformCommand = os.platform() === 'darwin' ? `ENVFILE=${envFileName} yarn ios` : `ENVFILE=${envFileName} yarn android`;

    console.log(`Attempting to start the app on ${os.platform() === 'darwin' ? 'iOS' : 'Android'}...`);

    exec(platformCommand, (error) => {
        if (error) {
            console.error(`Error starting app: ${error}`);
        }
    });
});
