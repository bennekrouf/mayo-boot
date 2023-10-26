import path from 'path';
import { execSync } from 'child_process';
import { openTerminalWithCommand } from '../openTerminalWithCommand';

export const cleanAndroidBuildArtifacts = (processCwd: string): void => {
    console.log('Cleaning Android build artifacts...');
    const androidDir = path.join(processCwd, 'android');
    execSync(`rm -rf ${path.join(androidDir, '.gradle')}`);
    execSync(`rm -rf ${path.join(androidDir, 'app', 'build')}`);
};

export const startAndroidApp = (processCwd: string, envFileName: string): void => {
    const startMetroBundler = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native start &`; // Notice the '&' at the end
    const startAndroidAppCmd = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native run-android`;
    const consolidatedCommand = `${startMetroBundler} ${startAndroidAppCmd}`;

    execSync(consolidatedCommand, { stdio: 'inherit' });
};
