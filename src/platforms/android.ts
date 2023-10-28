import path from 'path';
import { execSync } from 'child_process';

export const cleanAndroidBuildArtifacts = (processCwd: string): void => {
    console.log('Cleaning Android build artifacts...');
    const androidDir = path.join(processCwd, 'android');
    execSync(`rm -rf ${path.join(androidDir, '.gradle')}`);
    execSync(`rm -rf ${path.join(androidDir, 'app', 'build')}`);
};

export const startAndroidApp = (processCwd: string, envFileName: string): void => {
    const startAndroidAppCmd = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native run-android`;
    execSync(startAndroidAppCmd, { stdio: 'inherit' });
};
