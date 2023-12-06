#!/usr/bin/env node
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import os from 'os';
import path from 'path';
import net from 'net';

import http from 'http';

import { cleanAndroidBuildArtifacts, startAndroidApp } from './platforms/android';
import { cleanXcodeDerivedData, cleanWatchmanCache, bundleForiOS, installPods } from './platforms/ios';
import { killAllMetroInstances } from './killAllMetroInstances';
import { installDependencies } from './installDependencies';
import { addGoogleServiceInfoIfNotExists } from './addGoogleServiceInfoIfNotExists';

const forceInstall = process.argv.includes('-f') || process.argv.includes('--force');
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
    installDependencies(forceInstall);
    if (os.platform() === 'darwin') {
        installPods(forceInstall);
    }

    if (await isPortInUse(8081)) {
        console.log('Metro Bundler is already running on port 8081. Skipping...');
        return;
    }

    const metroBundlerProcess = spawn('npx', ['react-native', 'start', '--reset-cache'], {
        stdio: ['inherit', 'pipe', 'pipe'], // Only stdin is inherited
    });

    // Log Metro Bundler's output in real-time
    metroBundlerProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    metroBundlerProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
};

const startIOSApp = (envFileName: string): void => {
    const platformCommand: string = `ENVFILE=${envFileName} npx react-native run-ios --no-packager`;
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
    const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
    
    // Start the Metro Bundler asynchronously
    await startMetroBundler();

    if (platform === 'android') {
        cleanAndroidBuildArtifacts(process.cwd());
        startAndroidApp(process.cwd(), envFileName);
    } else if (platform === 'ios' || (os.platform() === 'darwin' && platformArg !== 'android')) {
        cleanXcodeDerivedData();
        cleanWatchmanCache();

        addGoogleServiceInfoIfNotExists();
        
        bundleForiOS(getEntryPoint());
        startIOSApp(envFileName);
    }
    // The script does not wait for the Metro Bundler to start or finish.
    // Metro Bundler runs in parallel to the following commands.
})();
