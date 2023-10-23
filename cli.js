#!/usr/bin/env node
const fs = require('fs');
const { execSync, exec } = require('child_process');
const os = require('os');
const path = require('path');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');

operationWithLaunchPackager(); // Start the Metro Bundler right after the initial setup.

if (platform === 'android') {
    cleanAndroidBuildArtifacts();
    startAndroidApp();
} else {
    cleanWatchmanCache();
    cleanXcodeDerivedData();
    bundleForiOS(); // bundle assets for iOS
    startApp(platform, envFileName);
}

function getLaunchPackagerPath() {
    return path.join(process.cwd(), 'node_modules', 'react-native', 'scripts', 'launchPackager.command');
}

function operationWithLaunchPackager() {
    const launchPackagerPath = getLaunchPackagerPath();
    
    console.log(`Starting Metro Bundler with: ${launchPackagerPath}`);
    
    switch(os.platform()) {
        case 'darwin':
            exec(`osascript -e 'tell app "Terminal" to do script "${launchPackagerPath}"'`);
            break;
        case 'linux':
            // Here, we're assuming you might also want to run it on Linux. Adjust as needed.
            const terminals = ["gnome-terminal", "konsole", "xterm", "terminator", "uxterm", "rxvt"];
            for (let terminal of terminals) {
                try {
                    execSync(`which ${terminal}`);
                    exec(`${terminal} -e 'bash -c "${launchPackagerPath}; bash"'`);
                    break;
                } catch (e) {
                    // Do nothing, we'll just try the next terminal.
                }
            }
            break;
        default:
            console.log('Unsupported OS. Please ensure Metro Bundler is running.');
            break;
    }
}

function startAndroidApp() {
    // Start Metro Bundler in a new terminal window.
    const startMetroBundler = `cd ${process.cwd()} && ENVFILE=${envFileName} npx react-native start`;
    
    switch(os.platform()) {
        case 'darwin':
            exec(`osascript -e 'tell app "Terminal" to do script "${startMetroBundler}"'`);
            break;
        case 'linux':
            // Attempting a sequence of popular Linux terminals until one is found.
            const terminals = ["gnome-terminal", "konsole", "xterm", "terminator", "uxterm", "rxvt"];
            for (let terminal of terminals) {
                try {
                    execSync(`which ${terminal}`);
                    exec(`${terminal} -e 'bash -c "${startMetroBundler}; bash"'`);
                    break;
                } catch (e) {
                    // Do nothing, we'll just try the next terminal.
                }
            }
            break;
        default:
            console.log('Please ensure Metro Bundler is running.');
            break;
    }

    // Provide a short delay for Metro Bundler to initialize.
    setTimeout(() => {
        startApp('android', envFileName);
    }, 5000);
}

function startApp(platform, envFileName) {
    const platformCommand = `ENVFILE=${envFileName} npx react-native run-${platform}`;
    console.log(`Attempting to start the app on ${platform}...`);
    
    // This will directly execute the command and keep it running in the terminal.
    execSync(platformCommand, { stdio: 'inherit' });
}

function cleanXcodeDerivedData() {
    if (os.platform() === 'darwin') {  // Check if platform is macOS
        console.log('Cleaning Xcode derived data...');
        execSync('rm -rf ~/Library/Developer/Xcode/DerivedData/');
    }
}

function cleanAndroidBuildArtifacts() {
    console.log('Cleaning Android build artifacts...');
    const androidDir = path.join(process.cwd(), 'android');
    execSync(`rm -rf ${path.join(androidDir, '.gradle')}`);
    execSync(`rm -rf ${path.join(androidDir, 'app', 'build')}`);
}

function bundleForiOS() {
    console.log('Bundling for iOS...');
    const entryPoint = getEntryPoint();
    const bundleCommand = `npx react-native bundle --entry-file='${entryPoint}' --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios'`;
    execSync(bundleCommand, { stdio: 'inherit' });
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

function cleanWatchmanCache() {
    console.log('Cleaning Watchman cache...');
    const projectPath = process.cwd(); // Get the root directory of the app

    try {
        execSync('watchman watch-del-all', { stdio: 'inherit' });
        execSync('watchman shutdown-server', { stdio: 'inherit' });
        
        console.log(`Resetting Watchman watch for ${projectPath}...`);
        execSync(`watchman watch-del '${projectPath}'`, { stdio: 'inherit' });
        execSync(`watchman watch-project '${projectPath}'`, { stdio: 'inherit' });
        
    } catch (error) {
        console.error('Failed to clean Watchman cache:', error.message);
    }
}
