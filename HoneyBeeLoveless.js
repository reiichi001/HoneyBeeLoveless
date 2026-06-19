const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { token, honeypotChannels } = require(path.join(__dirname, "config.json"));
const logger = require(path.join(__dirname, "/modules/Logger"));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.GuildMember,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
});

client.honeypotChannels = honeypotChannels;
client.logger = logger;

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    logger.cmd(`Loading Event: ${file}`);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}
client.login(token);

// Exit handling
process.stdin.resume();

function handle(signal) {
    logger.log(`Received ${signal}`);
    process.exit();
}

// catch ctrl+c event and exit normally
process.on('exit', function () {
    logger.log('Exiting bot...');
    process.exit(0);
});

//catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', function (e) {
    logger.error('Uncaught Exception...');
    logger.error(e.stack);
    process.exit(99);
});

process.on('SIGINT', handle);
process.on('SIGTERM', handle);