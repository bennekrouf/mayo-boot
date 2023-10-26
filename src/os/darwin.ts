import { exec } from 'child_process';

export const openTerminalWithCommand = (command: string): void => {
    exec(`osascript -e 'tell app "Terminal" to do script "${command}"'`);
};
