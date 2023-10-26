const { exec } = require('child_process');

module.exports = {
    openTerminalWithCommand: function(command) {
        exec(`osascript -e 'tell app "Terminal" to do script "${command}"'`);
    }
};
