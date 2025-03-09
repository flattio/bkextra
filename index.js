require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

// Initialize client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Environment variables (make sure to define them in your .env file)
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Slash Commands to register
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
        .setDescription('Replies with Pong and the bot\'s ping in ms!'),
    new SlashCommandBuilder()
        .setName('hi')
        .setDescription('Replies with "hi" in an ephemeral message')
].map(command => command.toJSON());

// Register commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
async function deployCommands() {
    try {
        console.log('Registering slash commands...');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('Slash commands registered!');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

// Once the bot is ready, deploy commands and set presence
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    deployCommands();
    client.user.setPresence({
        activities: [{ name: 'BKBot but extra', type: 4 }], // Type 4 is "Custom Status"
        status: 'online' // Options: 'online', 'idle', 'dnd', 'invisible'
    });
});

// Handle interactions (commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    try {
        if (interaction.commandName === 'say') {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');
            await channel.send(message);
            await interaction.reply({ content: 'Message sent!', ephemeral: true });
        } else if (interaction.commandName === 'ping') {
            const ping = Date.now() - interaction.createdTimestamp;
            await interaction.reply(`Pong! Latency is ${ping}ms.`);
        } else if (interaction.commandName === 'hi') {
            await interaction.reply({
                content: 'hi',
                ephemeral: true // Sends an ephemeral response, visible only to the user who invoked the command
            });
        }
    } catch (error) {
        console.error('Error handling command:', error);
        await interaction.reply({ content: 'There was an error while processing your command!', ephemeral: true });
    }
});

// Log in to Discord
client.login(TOKEN);
