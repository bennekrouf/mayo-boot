import path from 'path';
import { execSync } from 'child_process';
import { Logger } from 'mayo-logger';

export const cleanAndroidBuildArtifacts = (processCwd: string): void => {
    Logger.info('Cleaning Android build artifacts...', { tag: 'AndroidCleanup' });
    const androidDir = path.join(processCwd, 'android');
    try {
        execSync(`rm -rf ${path.join(androidDir, '.gradle')}`);
        execSync(`rm -rf ${path.join(androidDir, 'app', 'build')}`);
        Logger.info('Successfully cleaned Android build artifacts.', { tag: 'AndroidCleanup' });
    } catch (error) {
        Logger.error(`Error cleaning Android build artifacts: ${error}`, { tag: 'AndroidCleanup' });
    }
};

export const startAndroidApp = (processCwd: string, envFileName: string): void => {
    const startAndroidAppCmd = `cd ${processCwd} && ENVFILE=${envFileName} npx react-native run-android --no-packager`;
    Logger.info('Starting Android app...', { tag: 'AndroidStartup' });
    try {
        execSync(startAndroidAppCmd, { stdio: 'inherit' });
        Logger.info('Successfully started Android app.', { tag: 'AndroidStartup' });
    } catch (error) {
        Logger.error(`Error starting Android app: ${error}`, { tag: 'AndroidStartup' });
    }
};
