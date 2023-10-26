const { execSync } = require('child_process');

module.exports = {
    cleanXcodeDerivedData: function() {
        console.log('Cleaning Xcode derived data...');
        execSync('rm -rf ~/Library/Developer/Xcode/DerivedData/');
    },
    bundleForiOS: function(entryPoint) {
        console.log('Bundling for iOS...');
        const bundleCommand = `npx react-native bundle --entry-file='${entryPoint}' --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios'`;
        execSync(bundleCommand, { stdio: 'inherit' });
    },
    cleanXcodeDerivedData,
    cleanWatchmanCache,
};

function cleanXcodeDerivedData() {
    if (os.platform() === 'darwin') {  // Check if platform is macOS
        console.log('Cleaning Xcode derived data...');
        execSync('rm -rf ~/Library/Developer/Xcode/DerivedData/');
    }
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