#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const os = require('os');

const environment = process.argv[2] || 'local';
const platformArg = process.argv[3] || null;
const envFileName = `.env.${environment}`;

console.log(`Starting with environment file: ${envFileName}`);

const platform = platformArg || (os.platform() === 'darwin' ? 'ios' : 'android');

if (platform === 'android') {
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
        startApp(platform, envFileName);
    }, 5000);
} else {
    startApp(platform, envFileName);
}

function startApp(platform, envFileName) {
    const platformCommand = `ENVFILE=${envFileName} npx react-native run-${platform}`;
    console.log(`Attempting to start the app on ${platform}...`);
    
    // This will directly execute the command and keep it running in the terminal.
    execSync(platformCommand, { stdio: 'inherit' });
}
