#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import net from 'net';

import { openTerminalWithCommand } from './openTerminalWithCommand';
import { cleanAndroidBuildArtifacts, startAndroidApp } from './platforms/android';
import { cleanXcodeDerivedData, cleanWatchmanCache, bundleForiOS, installPods } from './platforms/ios';
import { killAllMetroInstances } from './killAllMetroInstances';
import { installDependencies } from './installDependencies';

const environment: string = process.argv[2] || 'local';
const platformArg: string | null = process.argv[3] || null;
const envFileName: string = `.env.${environment}`;

const getLaunchPackagerPath = (): string => 
    path.join(process.cwd(), 'node_modules', 'react-native', 'scripts', 'launchPackager.command');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isPortInUse = (port: number): Promise<boolean> => new Promise(resolve => {
    const server: net.Server = net.createServer();
    server.once('error', (err: Error & { code?: string }) => resolve(err.code === 'EADDRINUSE'));
    server.once('listening', () => {
        server.close();
        resolve(false);
    });
    server.listen(port);
});

const startMetroBundler = async (): Promise<void> => {
    killAllMetroInstances();
    installDependencies();

    if (os.platform() === 'linux') {
        execSync('npx react-native start --reset-cache', { stdio: 'inherit' });
        // await sleep(5000);
        return;
    }

    if(os.platform() === 'darwin') {
        installPods();
    }

    const launchPackagerPath: string = getLaunchPackagerPath();
    if (await isPortInUse(8081)) {
        console.log('Metro Bundler is already running on port 8081. Skipping...');
        return;
    }

    console.log(`Starting Metro Bundler with: ${launchPackagerPath}`);
    openTerminalWithCommand(launchPackagerPath);
    // await sleep(5000);
};

const startIOSApp = (envFileName: string): void => {
    const platformCommand: string = `ENVFILE=${envFileName} npx react-native run-ios`;
    console.log('Attempting to start the app on iOS...');
    execSync(platformCommand, { stdio: 'inherit' });
};

const getEntryPoint = (): string => {
    const possibleEntryPoints: string[] = ['index.js', 'index.ts', 'index.tsx'];
    return possibleEntryPoints.find(entry => fs.existsSync(path.join(process.cwd(), entry))) || 
           (() => { throw new Error('No valid entry point (index.js, index.ts, or index.tsx) was found.') })();
};

(async () => {
    console.log(`Starting with environment file: ${envFileName}`);
    const platform: string = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
    
    
    if (platform === 'android') {
        cleanAndroidBuildArtifacts(process.cwd());
        startAndroidApp(process.cwd(), envFileName);
    } else {
        cleanXcodeDerivedData();
        cleanWatchmanCache();
        bundleForiOS(getEntryPoint());
        startIOSApp(envFileName);
    }
    await startMetroBundler();
})();
