import { exec, execSync } from 'child_process';
import { Logger } from 'mayo-logger'; // Assuming you are using the same Logger from mayo-logger.

export const openTerminalWithCommand = (command: string): void => {
    const terminals = ["gnome-terminal", "konsole", "xterm", "terminator", "uxterm", "rxvt"];
    let terminalFound = false;

    for (let terminal of terminals) {
        try {
            // Check if terminal exists
            execSync(`which ${terminal}`);
            terminalFound = true;
            exec(`${terminal} -e 'bash -c "${command}; exec bash"'`, (error) => {
                if (error) {
                    Logger.error(`Failed to execute command in ${terminal}: ${error}`, { tag: 'OpenTerminal' });
                } else {
                    Logger.info(`Command executed in ${terminal}: ${command}`, { tag: 'OpenTerminal' });
                }
            });
            Logger.info(`Found and used terminal: ${terminal}`, { tag: 'OpenTerminal' });
            break; // Exit loop once a terminal is found and the command is executed
        } catch (error) {
            // Terminal not found, try the next one.
            Logger.warn(`Terminal not found: ${terminal}`, { tag: 'OpenTerminal' });
        }
    }

    if (!terminalFound) {
        Logger.error(`No compatible terminal found. Please install one of the following terminals: ${terminals.join(', ')}`, { tag: 'OpenTerminal' });
    }
};
