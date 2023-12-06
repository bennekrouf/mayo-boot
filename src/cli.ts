#!/usr/bin/env node
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import os from 'os';
import path from 'path';
import net from 'net';
import { Logger } from 'mayo-logger';

import http from 'http';

import { cleanAndroidBuildArtifacts, startAndroidApp } from './platforms/android';
import { cleanXcodeDerivedData, cleanWatchmanCache, bundleForiOS, installPods } from './platforms/ios';
import { killAllMetroInstances } from './killAllMetroInstances';
import { installDependencies } from './installDependencies';
import { addGoogleServiceInfoIfNotExists } from './addGoogleServiceInfoIfNotExists';
import { checkMissingiOSResources } from './checkMissingiOSResources';

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

    if (os.platform() === 'linux') {
        Logger.info('Starting Metro Bundler on Linux', { tag: 'MetroBundler' });
        execSync('npx react-native start --reset-cache', { stdio: 'inherit' });
        // await sleep(5000);
        return;
    }

    if (await isPortInUse(8081)) {
        Logger.info('Metro Bundler is already running on port 8081. Skipping...', { tag: 'MetroBundler' });
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
    if(os.platform() === 'darwin') {
        const launchPackagerPath: string = getLaunchPackagerPath();
        Logger.info(`Starting Metro Bundler using content from: ${launchPackagerPath}`, { tag: 'MetroBundler' });
        const commandContent: string = fs.readFileSync(launchPackagerPath, 'utf-8');
        execSync(commandContent, { stdio: 'inherit' });
    }
    // await sleep(5000);
};

const startIOSApp = (envFileName: string): void => {
    const platformCommand: string = `ENVFILE=${envFileName} npx react-native run-ios --no-packager`;
    Logger.info('Attempting to start the app on iOS...', { tag: 'IOSAppStart' });
    try {
        execSync(platformCommand, { stdio: 'inherit' });
    } catch (error) {
        Logger.error('Failed to start the iOS app', { error }, { tag: 'IOSAppStart' });
    }
};

const getEntryPoint = (): string => {
    const possibleEntryPoints: string[] = ['index.js', 'index.ts', 'index.tsx'];
    const entryPoint = possibleEntryPoints.find(entry => fs.existsSync(path.join(process.cwd(), entry)));
    if (!entryPoint) {
        Logger.error('No valid entry point (index.js, index.ts, or index.tsx) was found.', { tag: 'EntryPointCheck' });
        throw new Error('No valid entry point was found.');
    }
    Logger.info(`Entry point found: ${entryPoint}`, { tag: 'EntryPointCheck' });
    return entryPoint;
};

(async () => {
    try {
        Logger.info(`Starting with environment file: ${envFileName}`, { tag: 'AppStartup' });
        const platform: string = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
        
        if (platform === 'android') {
            cleanAndroidBuildArtifacts(process.cwd());
            startAndroidApp(process.cwd(), envFileName);
        } else if (platform === 'ios' || (os.platform() === 'darwin' && platformArg !== 'android')) {
            cleanXcodeDerivedData();
            cleanWatchmanCache();

            addGoogleServiceInfoIfNotExists();
            checkMissingiOSResources();
            
            bundleForiOS(getEntryPoint());
            startIOSApp(envFileName);
        }
        await startMetroBundler();
        Logger.info('Application started successfully', { tag: 'AppStartup' });
    } catch (error) {
        Logger.error('An error occurred during the application start process', { error }, { tag: 'AppStartup' });
    }
    // The script does not wait for the Metro Bundler to start or finish.
    // Metro Bundler runs in parallel to the following commands.
})();
