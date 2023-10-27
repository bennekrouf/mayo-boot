import { execSync } from 'child_process';

export const killAllMetroInstances = () => {
    try {
        killProcessOnPort(8081);
        // Kill any process that has 'metro' in its description
        execSync('pkill -f metro');
        console.log("Killed all running Metro instances");
    } catch (error) {
        console.log("No running Metro instances found or an error occurred while trying to kill Metro processes");
    }
};

const killProcessOnPort = (port: number): void => {
    try {
        execSync(`fuser -k ${port}/tcp`);
    } catch (e) {
        console.log(`No process to kill on port ${port} or an error occurred.`);
    }
};
