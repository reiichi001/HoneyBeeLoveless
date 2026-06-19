const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        client.logger.ready(`Logged in as ${client.user.tag}`);
    },
};