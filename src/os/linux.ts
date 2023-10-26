import { exec, execSync } from 'child_process';

export const openTerminalWithCommand = (command: string): void => {
    const terminals: string[] = ["gnome-terminal", "konsole", "xterm", "terminator", "uxterm", "rxvt"];
    for (let terminal of terminals) {
        try {
            execSync(`which ${terminal}`);
            exec(`${terminal} -e 'bash -c "${command}; bash"'`);
            break;  // Exit loop once a terminal is found and the command is executed
        } catch (e) {
            // Do nothing, we'll just try the next terminal.
        }
    }
};
