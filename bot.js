require('dotenv').config();  // Loads the .env file
// Log the token to ensure it's being loaded correctly
console.log(process.env.DISCORD_TOKEN);
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('Bot is online!');
});

// Log in to Discord using the token from the .env file
client.login(process.env.DISCORD_TOKEN);  // This will get the token from .env
