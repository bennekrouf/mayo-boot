const path = require('path');
const { execSync } = require('child_process');

module.exports = {
    cleanAndroidBuildArtifacts: function(processCwd) {
        console.log('Cleaning Android build artifacts...');
        const androidDir = path.join(processCwd, 'android');
        execSync(`rm -rf ${path.join(androidDir, '.gradle')}`);
        execSync(`rm -rf ${path.join(androidDir, 'app', 'build')}`);
    },
    startAndroidApp: function(processCwd, envFileName) {
        const startMetroBundler = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native start`;
        const startAndroidAppCmd = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native run-android`;
        const consolidatedCommand = `${startMetroBundler} && ${startAndroidAppCmd}`;
    
        openTerminalWithCommand(consolidatedCommand);
    }
};
