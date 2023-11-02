import { execSync } from 'child_process';
import os from 'os';
import { Logger } from 'mayo-logger'; // Make sure to import your Logger

export const cleanXcodeDerivedData = () => {
    if (os.platform() === 'darwin') {  // Check if platform is macOS
        Logger.info('Cleaning Xcode derived data...', { tag: 'XcodeCleanup' });
        try {
            execSync('rm -rf ~/Library/Developer/Xcode/DerivedData/');
            Logger.info('Successfully cleaned Xcode derived data.', { tag: 'XcodeCleanup' });
        } catch (error) {
            Logger.error(`Failed to clean Xcode derived data: ${error}`, { tag: 'XcodeCleanup' });
        }
    }
}

export const cleanWatchmanCache = () => {
    Logger.info('Cleaning Watchman cache...', { tag: 'WatchmanCleanup' });
    const projectPath = process.cwd(); // Get the root directory of the app

    try {
        execSync('watchman watch-del-all', { stdio: 'inherit' });
        execSync('watchman shutdown-server', { stdio: 'inherit' });
        Logger.info(`Resetting Watchman watch for ${projectPath}...`, { tag: 'WatchmanCleanup' });
        execSync(`watchman watch-project '${projectPath}'`, { stdio: 'inherit' });
        Logger.info('Successfully cleaned and reset Watchman cache.', { tag: 'WatchmanCleanup' });
    } catch (error) {
        Logger.error(`Failed to clean Watchman cache: ${error}`, { tag: 'WatchmanCleanup' });
    }
}

export const bundleForiOS = (entryPoint:any) => {
    Logger.info('Bundling for iOS...', { tag: 'iOSBundling' });
    const bundleCommand = `npx react-native bundle --entry-file='${entryPoint}' --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios'`;
    try {
        execSync(bundleCommand, { stdio: 'inherit' });
        Logger.info('Successfully bundled for iOS.', { tag: 'iOSBundling' });
    } catch (error) {
        Logger.error(`Failed to bundle for iOS: ${error}`, { tag: 'iOSBundling' });
    }
}

export const installPods = (forceInstall = false) => {
    const projectPath = process.cwd();

    if (os.platform() === 'darwin') {  // Check if platform is macOS
        Logger.info('Starting pod installation...', { tag: 'PodInstall' });
        if (forceInstall) {
            Logger.info('Force flag detected, removing Pods and Podfile.lock...', { tag: 'PodInstall' });
            execSync('rm -Rf Pods', { cwd: `${projectPath}/ios`, stdio: 'inherit' });
            execSync('rm -f Podfile.lock', { cwd: `${projectPath}/ios`, stdio: 'inherit' });
        }

        try {
            execSync('npx pod-install', { stdio: 'inherit' });
            Logger.info('Pods installed successfully.', { tag: 'PodInstall' });
        } catch (error) {
            Logger.error(`Failed to install pods: ${error}`, { tag: 'PodInstall' });
        }
    }
}
