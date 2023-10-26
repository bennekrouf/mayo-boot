const { exec, execSync } = require('child_process');

module.exports = {
    openTerminalWithCommand: function(command) {
        const terminals = ["gnome-terminal", "konsole", "xterm", "terminator", "uxterm", "rxvt"];
        for (let terminal of terminals) {
            try {
                execSync(`which ${terminal}`);
                exec(`${terminal} -e 'bash -c "${command}; bash"'`);
                break;  // Exit loop once a terminal is found and the command is executed
            } catch (e) {
                // Do nothing, we'll just try the next terminal.
            }
        }
    }
};
