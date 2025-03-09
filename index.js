require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "bke!";
const TOKEN = process.env.DISCORD_TOKEN; // Replace with your bot token
const CLIENT_ID = "1347447473014046842"; // Replace with your bot's client ID
const GUILD_ID = "1091441097915506841"; // Replace with your server's ID

const allowedRoles = ["1121590212011773962", "1091441098330746919"]; // Replace with actual role IDs

// Register the slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a message to a specific channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and the bot\'s ping in ms!') // Slash command for ping
].map(command => command.toJSON());

// Deploy commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
async function deployCommands() {
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log("Slash commands registered!");
    } catch (error) {
        console.error(error);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    deployCommands();
      // Set a custom status
    client.user.setPresence({
        activities: [{ name: 'BKBot but extra', type: 4 }], // Type 4 is "Custom Status"
        status: 'online' // Options: 'online', 'idle', 'dnd', 'invisible'
    });
});

// Prefix Command Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "say") {
        if (!args[0] || !args[1]) {
            return message.reply("Usage: `bke!say <#channel> | <channel-id> <message>`");
        }

        // Check for required role
        const hasRole = message.member.roles.cache.some(role => allowedRoles.includes(role.id));
        if (!hasRole) {
            return message.reply("You do not have permission to use this command.");
        }

        let channel;
        const channelArg = args.shift();
        const mentionMatch = channelArg.match(/^<#(\d+)>$/);
        channel = mentionMatch ? client.channels.cache.get(mentionMatch[1]) : client.channels.cache.get(channelArg);

        if (!channel) {
            return message.reply("Invalid channel. Mention a channel or provide a valid channel ID.");
        }

        try {
            await channel.send(args.join(" "));
            message.reply("Message sent!");
        } catch (error) {
            console.error(error);
            message.reply("Failed to send the message.");
        }
    } else if (command === "ping") {
        // Prefix Command: ping
        const ping = Date.now() - message.createdTimestamp;
        message.reply(`Pong! Latency is ${ping}ms.`);
    }
});

// Slash Command Handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "say") {
        const channel = interaction.options.getChannel("channel");
        const text = interaction.options.getString("message");

        // Check for required role
        const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));
        if (!hasRole) {
            return interaction.reply({ content: "You do not have permission to use this command.", flags: 64 });
        }

        try {
            await channel.send(text);
            interaction.reply({ content: "Message sent!", flags: 64 });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Failed to send the message.", flags: 64 });
        }
    } else if (interaction.commandName === "ping") {
        // Slash Command: ping
        const ping = Date.now() - interaction.createdTimestamp;
        interaction.reply(`Pong! Latency is ${ping}ms.`);
    }
});

client.login(TOKEN);
