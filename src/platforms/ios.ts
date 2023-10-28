import { execSync } from 'child_process';
import os from 'os';

export const cleanXcodeDerivedData = () => {
    if (os.platform() === 'darwin') {  // Check if platform is macOS
        console.log('Cleaning Xcode derived data...');
        execSync('rm -rf ~/Library/Developer/Xcode/DerivedData/');
    }
}

export const cleanWatchmanCache = () => {
    console.log('Cleaning Watchman cache...');
    const projectPath = process.cwd(); // Get the root directory of the app

    try {
        execSync('watchman watch-del-all', { stdio: 'inherit' });
        execSync('watchman shutdown-server', { stdio: 'inherit' });
        console.log(`Resetting Watchman watch for ${projectPath}...`);
        execSync(`watchman watch-project '${projectPath}'`, { stdio: 'inherit' });
    } catch (error:any) {
        console.error('Failed to clean Watchman cache:', error?.message);
    }
}

export const bundleForiOS = (entryPoint:any) => {
    console.log('Bundling for iOS...');
    const bundleCommand = `npx react-native bundle --entry-file='${entryPoint}' --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios'`;
    execSync(bundleCommand, { stdio: 'inherit' });
}

export const installPods = (forceInstall = false) => {
    const projectPath = process.cwd();

    if (os.platform() === 'darwin') {  // Check if platform is macOS
        if (forceInstall) {
            console.log('Force flag detected, removing Pods and Podfile.lock...');
            execSync('rm -Rf Pods', { cwd: `${projectPath}/ios`, stdio: 'inherit' });
            execSync('rm -f Podfile.lock', { cwd: `${projectPath}/ios`, stdio: 'inherit' });
        }

        console.log('Installing pods...');
        execSync('npx pod-install', { stdio: 'inherit' });
    }
}