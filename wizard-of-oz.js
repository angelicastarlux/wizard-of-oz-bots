const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { registerCommands, commands } = require('./registerCommands'); // Import commands directly from registerCommands.js
const registerNonSlashCommands = require('./nonSlashCommands'); // Import non-slash commands
const interactionHandler = require('./interactionCreate'); // Correct import
const characters = require('./oz-characters'); // Import oz-characters.js
const categories = require('./categories'); // Import categories.js (as array)

const mongoURL = process.env.MONGO_URL; // Ensure this is correctly set in your .env file

console.log("Mongo URL:", mongoURL); // Debugging: Log the Mongo URL

const userHarems = new Map(); // This stores the user's harem data
const claimedCharacters = new Map(); // This stores the claimed characters

// Initialize the client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

// Register non-slash commands AFTER the client is defined
registerNonSlashCommands(client);

// Import the ready.js file
const ready = require('./ready.js');

// Define the initializeBot async function
const initializeBot = async () => {
  try {
    // Connect to MongoDB
    // await mongoose.connect(mongoURL);
    // console.log('Connected to MongoDB!');

    
    // Log in with the token from the .env file
    await client.login(process.env.DISCORD_TOKEN);
    console.log('Bot logged in successfully!');

    // Register the interaction handler function
    interactionHandler(client, userHarems, characters, claimedCharacters, categories); // This should now work

    // Call the execute function from ready.js after the bot logs in
    await ready.execute(client);
  } catch (error) {
    console.error('Error logging in or connecting to MongoDB:', error);
  }
};

// Call the initializeBot function to start the bot
initializeBot();

// Register the commands when the bot is ready
client.on(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Log the commands array to see its contents
  console.log(commands); // This logs the commands array

  // Register the commands
  try {
    const registeredCmds = await client.application.commands.set(commands);
    console.log(`${registeredCmds.size} commands registered!`);

    // Log the registered commands
    const commandsList = await client.application.commands.fetch();
    console.log('Registered commands:', commandsList);
  } catch (error) {
    console.error(`Error registering commands: ${error.message}`);
  }
});

// Non-slash commands are handled by nonSlashCommands.js