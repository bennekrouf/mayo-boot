#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

const environment = process.argv[2] || 'local';
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

const startCommand = `ENVFILE=${envFileName} yarn start`;

console.log('Attempting to start Metro bundler...');

const metroBundlerProcess = exec(startCommand);

metroBundlerProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
});

metroBundlerProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
});

metroBundlerProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Error starting Metro bundler with exit code ${code}`);
        return;
    }

    console.log('Metro bundler started!');

    const platformCommand = os.platform() === 'darwin' ? `ENVFILE=${envFileName} yarn ios` : `ENVFILE=${envFileName} yarn android`;

    console.log(`Attempting to start the app on ${os.platform() === 'darwin' ? 'iOS' : 'Android'}...`);

    const platformProcess = exec(platformCommand);

    platformProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    platformProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });

    platformProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Error starting app with exit code ${code}`);
        }
    });
});
