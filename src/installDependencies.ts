import fs from 'fs';
import { execSync } from 'child_process';
import { Logger } from 'mayo-logger'; // Import Logger from mayo-logger

export const installDependencies = (forceInstall = false) => {
    const projectPath = process.cwd();

    if (forceInstall) {
        Logger.info('Force flag detected, removing node_modules...', { tag: 'installDependencies' });
        execSync('rm -Rf node_modules', { stdio: 'inherit' });
    }

    if (fs.existsSync(`${projectPath}/package-lock.json`)) {
        Logger.info('Detected package-lock.json, running npm install...', { tag: 'installDependencies' });
        execSync('npm install', { stdio: 'inherit' });
    } else if (fs.existsSync(`${projectPath}/yarn.lock`)) {
        Logger.info('Detected yarn.lock, running yarn install...', { tag: 'installDependencies' });
        execSync('yarn install', { stdio: 'inherit' });
    } else {
        Logger.warn('No package-lock.json or yarn.lock detected. You may need to run npm install or yarn install manually.', { tag: 'installDependencies' });
    }
};
