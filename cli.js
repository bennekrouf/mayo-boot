#!/usr/bin/env node
const fs = require('fs');
const { execSync, exec } = require('child_process');
const os = require('os');
const path = require('path');
const ios = require('./platforms/ios');
const android = require('./platforms/android');

const darwinOS = require('./os/darwin');
const linuxOS = require('./os/linux');
const defaultOS = require('./os/default');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

(async () => {
    console.log(`Starting with environment file: ${envFileName}`);
    
    const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
    
    await operationWithLaunchPackager(); // Wait for this to complete before proceeding
    
    if (platform === 'android') {
        android.cleanAndroidBuildArtifacts(process.cwd());
        android.startAndroidApp(process.cwd(), envFileName);
    } else {
        ios.cleanXcodeDerivedData();
        const entryPoint = getEntryPoint();
        ios.bundleForiOS(entryPoint);
        startApp(platform, envFileName);
    }
})();

function getLaunchPackagerPath() {
    return path.join(process.cwd(), 'node_modules', 'react-native', 'scripts', 'launchPackager.command');
}

async function operationWithLaunchPackager() {
    const launchPackagerPath = getLaunchPackagerPath();
    const isPort8081InUse = await isPortInUse(8081);
    
    if (isPort8081InUse) {
        console.log('Metro Bundler is already running on port 8081. Skipping...');
        return;
    }

    console.log(`Starting Metro Bundler with: ${launchPackagerPath}`);
    
    openTerminalWithCommand(launchPackagerPath);
}

function startApp(platform, envFileName) {
    const platformCommand = `ENVFILE=${envFileName} npx react-native run-${platform}`;
    console.log(`Attempting to start the app on ${platform}...`);
    
    // This will directly execute the command and keep it running in the terminal.
    execSync(platformCommand, { stdio: 'inherit' });
}

function getEntryPoint() {
    const possibleEntryPoints = ['index.js', 'index.ts', 'index.tsx'];

    for (let entry of possibleEntryPoints) {
        if (fs.existsSync(path.join(process.cwd(), entry))) {
            return entry;
        }
    }

    throw new Error('No valid entry point (index.js, index.ts, or index.tsx) was found.');
}

function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = require('net').createServer();
        server.once('error', function(err) {
            resolve(err.code === 'EADDRINUSE' ? true : false);
        });
        server.once('listening', function() {
            server.close();
            resolve(false);
        });
        server.listen(port);
    });
}

function openTerminalWithCommand(command) {
    switch(os.platform()) {
        case 'darwin':
            darwinOS.openTerminalWithCommand(command);
            break;
        case 'linux':
            linuxOS.openTerminalWithCommand(command);
            break;
        default:
            defaultOS.openTerminalWithCommand();
            break;
    }
}
