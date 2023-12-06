import { execSync } from 'child_process';
import { Logger } from 'mayo-logger'; // Import Logger from mayo-logger

export const killAllMetroInstances = () => {
    try {
        killProcessOnPort(8081);
        // Kill any process that has 'metro' in its description
        execSync('pkill -f metro');
        Logger.info("Killed all running Metro instances", { tag: 'killAllMetroInstances' });
    } catch (error) {
        Logger.error("No running Metro instances found or an error occurred while trying to kill Metro processes", { error }, { tag: 'killAllMetroInstances' });
    }
};

const killProcessOnPort = (port: number): void => {
    try {
        execSync(`fuser -k ${port}/tcp`);
        Logger.info(`Killed process on port ${port}`, { tag: 'killProcessOnPort' });
    } catch (e) {
        Logger.error(`No process to kill on port ${port} or an error occurred.`, { error: e }, { tag: 'killProcessOnPort' });
    }
};
