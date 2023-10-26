import path from 'path';
import { execSync } from 'child_process';

const cleanAndroidBuildArtifacts = (processCwd) => {
    console.log('Cleaning Android build artifacts...');
    const androidDir = path.join(processCwd, 'android');
    execSync(`rm -rf ${path.join(androidDir, '.gradle')}`);
    execSync(`rm -rf ${path.join(androidDir, 'app', 'build')}`);
};

const startAndroidApp = (processCwd, envFileName) => {
    const startMetroBundler = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native start`;
    const startAndroidAppCmd = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native run-android`;
    const consolidatedCommand = `${startMetroBundler} && ${startAndroidAppCmd}`;

    openTerminalWithCommand(consolidatedCommand);
};

export { cleanAndroidBuildArtifacts, startAndroidApp };
