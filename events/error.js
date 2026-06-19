const { Events } = require('discord.js');

module.exports = {
    name: Events.Error,
    execute(client, error) {
        client.logger.error(`An error event was sent by Discord.js: \n${error}`);
    },
};