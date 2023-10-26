#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import ios from './platforms/ios';
import android from './platforms/android';
import darwinOS from './os/darwin';
import linuxOS from './os/linux';
import defaultOS from './os/default';

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

(async () => {
    console.log(`Starting with environment file: ${envFileName}`);
    
    const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
    
    await operationWithLaunchPackager(); 
    
    platform === 'android' 
        ? (android.cleanAndroidBuildArtifacts(process.cwd()), android.startAndroidApp(process.cwd(), envFileName))
        : (ios.cleanXcodeDerivedData(), ios.bundleForiOS(getEntryPoint()), startApp(platform, envFileName));
})();

const getLaunchPackagerPath = () => path.join(process.cwd(), 'node_modules', 'react-native', 'scripts', 'launchPackager.command');

const operationWithLaunchPackager = async () => {
    const launchPackagerPath = getLaunchPackagerPath();
    if (await isPortInUse(8081)) {
        console.log('Metro Bundler is already running on port 8081. Skipping...');
        return;
    }
    console.log(`Starting Metro Bundler with: ${launchPackagerPath}`);
    openTerminalWithCommand(launchPackagerPath);
};

const startApp = (platform, envFileName) => {
    const platformCommand = `ENVFILE=${envFileName} npx react-native run-${platform}`;
    console.log(`Attempting to start the app on ${platform}...`);
    execSync(platformCommand, { stdio: 'inherit' });
};

const getEntryPoint = () => {
    const possibleEntryPoints = ['index.js', 'index.ts', 'index.tsx'];
    return possibleEntryPoints.find(entry => fs.existsSync(path.join(process.cwd(), entry))) || 
           (() => { throw new Error('No valid entry point (index.js, index.ts, or index.tsx) was found.') })();
};

const isPortInUse = port => new Promise(resolve => {
    const server = require('net').createServer();
    server.once('error', err => resolve(err.code === 'EADDRINUSE'));
    server.once('listening', () => {
        server.close();
        resolve(false);
    });
    server.listen(port);
});

const openTerminalWithCommand = command => {
    const action = {
        'darwin': () => darwinOS.openTerminalWithCommand(command),
        'linux': () => linuxOS.openTerminalWithCommand(command),
        'default': () => defaultOS.openTerminalWithCommand()
    };
    (action[os.platform()] || action['default'])();
};
