import fs from 'fs';
import { execSync } from 'child_process';

export const installDependencies = (forceInstall = false) => {
    const projectPath = process.cwd();

    if (forceInstall) {
        console.log('Force flag detected, removing node_modules...');
        execSync('rm -Rf node_modules', { stdio: 'inherit' });
    }

    if (fs.existsSync(`${projectPath}/package-lock.json`)) {
        console.log('Detected package-lock.json, running npm install...');
        execSync('npm install', { stdio: 'inherit' });
    } else if (fs.existsSync(`${projectPath}/yarn.lock`)) {
        console.log('Detected yarn.lock, running yarn install...');
        execSync('yarn install', { stdio: 'inherit' });
    } else {
        console.warn('No package-lock.json or yarn.lock detected. You may need to run npm install or yarn install manually.');
    }
}