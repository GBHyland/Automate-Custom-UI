const { resolve } = require('path');

module.exports = function runCommand(commandsRootDir) {
    const commandCategory = process.argv[2],
        commandName = process.argv[3],
        CommandRunner = require(resolve(commandsRootDir, 'shared', 'command', 'command-runner')).default,
        commandArgs = [...process.argv],
        commandFile = resolve(commandsRootDir, `${commandCategory}/commands/${commandName}`);

    commandArgs.splice(2, 1);
    new CommandRunner(commandFile, commandArgs).invoke().catch((error) => {
        console.error(error.message);
        console.log(error);
        process.exit(1);
    });
};
