const { SlashCommandBuilder } = require('discord.js');

const categories = {
  main: ['Twilight Sparkle', 'Rainbow Dash', 'Pinkie Pie'],
  villains: ['Queen Chrysalis', 'Discord', 'Nightmare Moon'],
  background: ['Lyra Heartstrings', 'Derpy Hooves'],
};

const commands = [
  new SlashCommandBuilder()
    .setName('ozwaifus')
    .setDescription('Roll a random character to claim!'),
  new SlashCommandBuilder()
    .setName('harem')
    .setDescription('View your harem of characters!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view their harem!')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('collection')
    .setDescription('Show your collection of characters!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to show the collection of')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('characters')
    .setDescription('Show a list of all available characters!'),
  new SlashCommandBuilder()
    .setName('reset-harem')
    .setDescription('Reset your harem collection!'),
  new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade characters with another user!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to trade characters with')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('character')
        .setDescription('The character you want to trade')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('search-characters')
    .setDescription('Search for characters by name or category!')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('What would you like to search for?')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('categories')
    .setDescription('Select a category to view')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Select a category')
        .setRequired(true)
        .addChoices(
          { name: 'Main Characters', value: 'main' },
          { name: 'Witches', value: 'witches' },
          { name: 'Munchkins', value: 'munchkins' }
        )
    ),
].map(command => command.toJSON());

module.exports = async (client) => {
  try {
    if (client.isReady()) {
      const commandReg = await client.application.commands.set(commands);
      console.log(`${commandReg.length} commands successfully registered!`);
    } else {
      console.log('Client is not ready. Cannot register commands.');
    }

    // Unified interaction event listener
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'categories') {
        const selectedCategory = interaction.options.getString('category');
        const characters = categories[selectedCategory];

        if (characters) {
          await interaction.reply(`Available characters in ${selectedCategory}: ${characters.join(', ')}`);
        } else {
          await interaction.reply(`No characters found in ${selectedCategory}`);
        }
      }

      // Additional command logic can go here
    });
  } catch (error) {
    console.error('Error registering commands:', error);
  }
};