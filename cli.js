#!/usr/bin/env node
const fs = require('fs');
const { execSync, exec } = require('child_process');
const os = require('os');
const path = require('path');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

(async () => {
    console.log(`Starting with environment file: ${envFileName}`);
    
    const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');
    
    await operationWithLaunchPackager(); // Wait for this to complete before proceeding
    
    if (platform === 'android') {
        cleanAndroidBuildArtifacts();
        startAndroidApp();
    } else {
        cleanWatchmanCache();
        cleanXcodeDerivedData();
        bundleForiOS(); // bundle assets for iOS
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

function startAndroidApp() {
    const startMetroBundler = `cd ${process.cwd()} && ENVFILE=${envFileName} npx react-native start`;
    const startAndroidAppCmd = `cd ${process.cwd()} && ENVFILE=${envFileName} npx react-native run-android`;
    const consolidatedCommand = `${startMetroBundler} && ${startAndroidAppCmd}`;
    
    openTerminalWithCommand(consolidatedCommand);
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

function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = require('net').createServer();
        server.once('error', function(err) {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        server.once('listening', function() {
            server.close();
            resolve(false);
        });
        server.listen(port);
    });
}

// New function to consolidate the terminal opening logic
function openTerminalWithCommand(command) {
    switch(os.platform()) {
        case 'darwin':
            exec(`osascript -e 'tell app "Terminal" to do script "${command}"'`);
            break;
        case 'linux':
            const terminals = ["gnome-terminal", "konsole", "xterm", "terminator", "uxterm", "rxvt"];
            for (let terminal of terminals) {
                try {
                    execSync(`which ${terminal}`);
                    exec(`${terminal} -e 'bash -c "${command}; bash"'`);
                    break;  // Exit loop once a terminal is found and the command is executed
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