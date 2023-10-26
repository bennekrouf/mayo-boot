import os from 'os';

import { openTerminalWithCommand as dopen} from './os/darwin';
import { openTerminalWithCommand as lopen} from './os/linux';
import { openTerminalWithCommand as fopen} from './os/default';

export const openTerminalWithCommand = (command: string): void => {
    const action: Record<string, () => void> = {
        'darwin': () =>  dopen(command),
        'linux': () => lopen(command),
        'default': () => fopen()
    };
    (action[os.platform()] || action['default'])();
};