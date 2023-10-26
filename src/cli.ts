#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import net from 'net'; // Point 2: ES6 import for net

import { openTerminalWithCommand } from './openTerminalWithCommand';
import { cleanAndroidBuildArtifacts, startAndroidApp } from './platforms/android';
import { cleanXcodeDerivedData, cleanWatchmanCache, bundleForiOS } from './platforms/ios';

const environment: string = process.argv[2] || 'local';
const platformArg: string | null = process.argv[3] || null;
const envFileName: string = `.env.${environment}`;

const getLaunchPackagerPath = (): string => path.join(process.cwd(), 'node_modules', 'react-native', 'scripts', 'launchPackager.command');
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const operationWithLaunchPackager = async (): Promise<void> => {
    if (os.platform() === 'linux') {
        // Use the standard command for Linux
        execSync('npx react-native start', { stdio: 'inherit' });
        await sleep(5000);  // Wait for 5 seconds to ensure Metro Bundler starts.
        return;
    }
    
    const launchPackagerPath: string = getLaunchPackagerPath();
    if (await isPortInUse(8081)) {
        console.log('Metro Bundler is already running on port 8081. Skipping...');
        return;
    }
    
    console.log(`Starting Metro Bundler with: ${launchPackagerPath}`);
    openTerminalWithCommand(launchPackagerPath);
    await sleep(5000);  // Wait for 5 seconds to ensure Metro Bundler starts.
};

const startApp = (platform: string, envFileName: string): void => {
    const platformCommand: string = `ENVFILE=${envFileName} npx react-native run-${platform}`;
    console.log(`Attempting to start the app on ${platform}...`);
    execSync(platformCommand, { stdio: 'inherit' });
};

const getEntryPoint = (): string => {
    const possibleEntryPoints: string[] = ['index.js', 'index.ts', 'index.tsx'];
    return possibleEntryPoints.find(entry => fs.existsSync(path.join(process.cwd(), entry))) || 
           (() => { throw new Error('No valid entry point (index.js, index.ts, or index.tsx) was found.') })();
};

const isPortInUse = (port: number): Promise<boolean> => new Promise(resolve => {
    const server: net.Server = net.createServer();
    server.once('error', (err: Error & { code?: string }) => resolve(err.code === 'EADDRINUSE'));
    server.once('listening', () => {
        server.close();
        resolve(false);
    });
    server.listen(port);
});

(async () => {
    console.log(`Starting with environment file: ${envFileName}`);
    
    const platform: string = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
    
    await operationWithLaunchPackager(); 
    
    platform === 'android' 
        ? (cleanAndroidBuildArtifacts(process.cwd()), startAndroidApp(process.cwd(), envFileName))
        : (cleanXcodeDerivedData(), cleanWatchmanCache(), bundleForiOS(getEntryPoint()), startApp(platform, envFileName));
})();