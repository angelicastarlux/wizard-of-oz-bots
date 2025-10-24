const { SlashCommandBuilder } = require('discord.js');
const { data: categoriesCommandData } = require('./categories'); // Destructure 'data' from categories.js

console.log("Starting script execution...");

const commands = [
  new SlashCommandBuilder()
    .setName('ozwaifus')
    .setDescription('Show your favorite Oz characters!')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('harem')
    .setDescription('Manage your harem!')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('collection')
    .setDescription('View your collection of characters!')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('characters')
    .setDescription('Show available Wizard of Oz characters!')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('reset-harem')
    .setDescription('Reset your harem!')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade characters!')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('search-characters')
    .setDescription('Search for Wizard of Oz characters!')
    .toJSON(),
];

console.log("Static commands array created.");

// Check if the categories command is valid
if (!categoriesCommandData || typeof categoriesCommandData !== 'object') {
  console.error("Error: Failed to load the categories command from categories.js.");
  process.exit(1); // Exit the script if categoriesCommandData is invalid
}

// Combine static commands with the dynamic categories command
const allCommands = [...commands, categoriesCommandData];

console.log(`All commands array created with ${allCommands.length} commands.`);

module.exports = {
  commands: allCommands,

  async registerCommands(client) {
    try {
      console.log("Starting to register commands...");

      // Register all the commands
      const registeredCmds = await client.application.commands.set(allCommands);

      console.log(`${registeredCmds.size} commands registered successfully!`);
    } catch (error) {
      console.error("Error registering commands:", error);
    }
  },
};