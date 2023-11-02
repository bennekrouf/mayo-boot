import { exec } from 'child_process';
import { Logger } from 'mayo-logger';

export const openTerminalWithCommand = (command: string): void => {
    const scriptCommand = `osascript -e 'tell app "Terminal" to do script "${command}"'`;
    
    exec(scriptCommand, (error, stdout, stderr) => {
        if (error) {
            Logger.error(`Error opening terminal with command: ${error.message}`, { tag: 'OpenTerminal' });
            return;
        }
        if (stderr) {
            Logger.warn(`Terminal opened with command but reported an error: ${stderr}`, { tag: 'OpenTerminal' });
            return;
        }
        Logger.info(`Terminal opened and command executed: ${command}`, { tag: 'OpenTerminal' });
    });
};
