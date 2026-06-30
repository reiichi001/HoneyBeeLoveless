const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(client, message) {
        if (message.partial) {
            message = await message.fetch()
                .catch(error => {
                    client.logger.error(`Something went wrong when fetching the message:\n => ${error}`);
                });
        }

        if (message.channel.type !== ChannelType.GuildText) return; // ignore anything that's not in a guild
        if (message.author.bot || message.webhookId) return; // ignore bots and webhooks
        if (!client.honeypotChannels.includes(message.channelId)) return;

        let author = message.author;
        let guild = message.guild;
        let guildChannel = message.channel;
        let guildMember = guild.members.cache.get(message.author.id)
        let userNameFull = `${author.username}#${author.discriminator}`;

        try {
            client.logger.warn(
                `[${Date.now()}] Honeypot triggered by ${userNameFull} ` +
                `(ID: ${author.id}) in #${guildChannel.name} on ${guild.name}`
            );

            await guildMember.ban({
                deleteMessageSeconds: 60 * 60 * 24,
                reason: `HoneyBot: ${author.username} (ID: ${author.id}) sent a message in honeypot channel #${guildChannel.name}`
            });
            client.logger.debug(`Banned ${userNameFull} (ID: ${author.id}) from ${guild.name}.`);

            await guild.bans.remove(author.id);
            client.logger.debug(`Unbanned ${userNameFull} (ID: ${author.id}) from ${guild.name}.`);
        }
        catch (ex) {
            client.logger.error(
                `Failed to softban ${userNameFull} (ID: ${author.id}) from ${guild.name}:\n => ${ex}`);
        }
    },
};