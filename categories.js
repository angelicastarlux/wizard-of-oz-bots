const { SlashCommandBuilder } = require('discord.js');

const categories = [
  "Main Characters",
  "Witches",
  "Munchkins",
  "Citizens of Oz",
  "Winged Monkeys",
  "Emerald City Residents",
  "Kansas Characters",
  "Royal/Nobility",
  "Magical Creatures",
  "Guards & Soldiers",
  "Supporting Characters",
  "Movie Characters",
  "Book Characters",
  "Quadlings",
  "Winkies",
  "Gillikins",
  "Miscellaneous"
];

// Define the categories command with all required fields
const categoriesCommand = new SlashCommandBuilder()
  .setName('categories') // Ensure this is set correctly
  .setDescription('Show available Wizard of Oz character categories!')
  .addStringOption(option =>
    option.setName('category')
      .setDescription('Select a category to see characters')
      .setRequired(false)
      .addChoices(
        ...categories.map(category => ({ name: category, value: category }))
      )
  );

// Export both categories array and the categories command correctly
module.exports = {
  categories,
  data: categoriesCommand.toJSON(), // Added .toJSON() here to serialize the command correctly
};