const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Events } = require('discord.js');
const moment = require('moment'); // For timestamp formatting and comparisons

module.exports = (client, userHarems, characters, claimedCharacters, categories) => {
  const embedColor = "#FFADD6";  // Consistent embed color

  // Map to store user's roll data and claim data
  const rollData = new Map(); // Stores roll history (userID -> { rolls: number, lastRollTime: timestamp })
  const claimData = new Map(); // Stores claim history (userID -> { lastClaimTime: timestamp })

  // Command Handlers
  client.on('interactionCreate', async (interaction) => {
    try {
      if (!interaction.isCommand() && !interaction.isStringSelectMenu()) return;

      const { commandName } = interaction;
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;

      // Handle commands
      if (interaction.isCommand()) {
        switch (commandName) {
          case 'ozwaifus': {
            const currentTime = moment();
            // Ensure user roll data exists, otherwise initialize it
            let userRoll = rollData.get(userId) || { rolls: 0, lastRollTime: currentTime };
            let userClaim = claimData.get(userId) || { lastClaimTime: currentTime };

            // Check if the user has rolled 5 times in the last hour
            if (userRoll.rolls >= 5 && currentTime.diff(moment(userRoll.lastRollTime), 'hours') < 1) {
              const timeRemaining = moment.duration(1, 'hours').subtract(currentTime.diff(moment(userRoll.lastRollTime), 'milliseconds'));
              const hours = timeRemaining.hours();
              const minutes = timeRemaining.minutes();
              const seconds = timeRemaining.seconds();

              return interaction.reply({
                content: `You have already rolled 5 times in the past hour! Please try again in ${hours} hour(s), ${minutes} minute(s), and ${seconds} second(s).`,
                ephemeral: true,
              });
            }

            // Check if the user has claimed a character in the last hour
            if (currentTime.diff(moment(userClaim.lastClaimTime), 'hours') < 1) {
              const timeRemaining = moment.duration(1, 'hours').subtract(currentTime.diff(moment(userClaim.lastClaimTime), 'milliseconds'));
              const hours = timeRemaining.hours();
              const minutes = timeRemaining.minutes();
              const seconds = timeRemaining.seconds();

              return interaction.reply({
                content: `You can only claim one character per hour! Please try again in ${hours} hour(s), ${minutes} minute(s), and ${seconds} second(s).`,
                ephemeral: true,
              });
            }

            // Proceed with rolling a character
            if (!characters || characters.length === 0) {
              return interaction.reply('No characters available to claim!');
            }

            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
            const randomCharacterEmbed = new EmbedBuilder()
              .setTitle(`**${randomCharacter.name}**`)
              .setDescription('React to the 💖 to claim.')
              .setImage(randomCharacter.image)
              .setColor(embedColor)
              .setTimestamp();

            const sentMessage = await interaction.reply({ embeds: [randomCharacterEmbed], fetchReply: true });
            const key = `${guildId}-${sentMessage.id}`;
            claimedCharacters.set(key, randomCharacter);

            // Update user's roll history (increment rolls and set last roll time)
            userRoll.rolls += 1;
            userRoll.lastRollTime = currentTime;
            rollData.set(userId, userRoll);

            // Save the claim history (update last claim time)
            claimData.set(userId, { lastClaimTime: currentTime });

            break;
          }

          case 'characters': { // Added case for /characters command
            if (!characters || characters.length === 0) {
              return interaction.reply('No characters available at the moment!');
            }

            const characterNames = characters.map((character) => character.name).join(', ');
            return interaction.reply(`Here are the available Wizard of Oz characters: ${characterNames}`);
          }

          // Default case for unknown commands
          default: {
            return interaction.reply({
              content: `Unknown command: \`${commandName}\`. Please try again later.`,
              ephemeral: true,
            });
          }
        }
      }

      // Handle other interactions...
    } catch (error) {
      console.error("Error handling interaction:", error);
      return interaction.reply({ content: 'Something went wrong while processing the command. Please try again later.', ephemeral: true });
    }
  });


  // Reaction handling (add this if you're using message reactions in your bot)
};