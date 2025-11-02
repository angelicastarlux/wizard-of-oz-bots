const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix } = require('./config.json');
const characters = require('./oz-characters'); // Assuming your character list is an array of objects
const cooldowns = new Map();
// Map to store claimed characters with server-specific ownership
// Format: Map<`${guildId}-${messageId}`, { character, ownerId }>
const claimedCharacters = new Map();
// Map to track number of claims per user per server
// Format: Map<`${guildId}-${userId}`, { claims: number, lastClaimTime: timestamp }>
const claimCounts = new Map();
// Maximum claims allowed per cooldown period
const maxClaimsPerPeriod = 2;
// Map to store server-specific character ownership
// Format: Map<`${guildId}-${characterName}`, userId>
const serverCharacterOwnership = new Map();
const embedColor = "#FFADD6"; // Example embed color
const penaltyTime = 1200000; // 20 minutes in milliseconds
const rollWindow = 3600000; // 1 hour in milliseconds
const rollsPerHour = 10; // User can roll 10 times per hour

// Track if handlers have been registered to prevent duplicates
let handlersRegistered = false;

module.exports = (client) => {
  // Prevent duplicate registration
  if (handlersRegistered) {
    console.log('Handlers already registered, skipping duplicate registration');
    return;
  }
  handlersRegistered = true;
  console.log('Registering non-slash command handlers...');
  client.on('messageCreate', async (message) => {
  // IMPORTANT: Stop processing if message is from a bot or doesn't start with prefix
  if (message.author.bot || !message.content.startsWith(prefix)) return;
  
  console.log('Handler triggered:', message.content, 'author:', message.author.id);
  console.log('Received command:', message.content);
  console.log('message.author.id:', message.author.id, 'client.user.id:', client.user.id);

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'ow': // Oz Waifu Roll Command
        {
          const owUserId = message.author.id;
          const owGuildId = message.guild.id;
          const owUserServerKey = `${owGuildId}-${owUserId}`;
          const owNow = Date.now();

          // Check for existing cooldown and get roll data
          let owUserData = cooldowns.get(owUserServerKey) || { lastRoll: 0, rollsLeft: rollsPerHour };
          const owTimeSinceLastRoll = owNow - owUserData.lastRoll;

          // Reset rolls if cooldown period has passed
          if (owTimeSinceLastRoll >= rollWindow) {
            owUserData = { lastRoll: owNow, rollsLeft: rollsPerHour };
          }

          // Check if user has any rolls left
          if (owUserData.rollsLeft <= 0) {
            const owTimeLeft = rollWindow - (owNow - owUserData.lastRoll);
            const owMinutesLeft = Math.floor(owTimeLeft / 60000);
            const owSecondsLeft = Math.floor((owTimeLeft % 60000) / 1000);
            return message.channel.send(
              `You have used all your rolls! Please wait **${owMinutesLeft}m ${owSecondsLeft}s** for rolls to reset.`
            );
          }

          // Proceed with rolling a character
          const owRolledCharacter = characters[Math.floor(Math.random() * characters.length)];

          // Create the embed for the rolled character
          const owEmbed = new EmbedBuilder()
            .setTitle(`**${owRolledCharacter.name}**`)
            .setDescription('React with 💖 to claim this character.')
            .setImage(owRolledCharacter.image)
            .setColor(embedColor)
            .setTimestamp();

          // Send the embed and add the reaction
          const owRollMessage = await message.channel.send({ embeds: [owEmbed] });
          await owRollMessage.react('💖');

          // Store the character in the claimedCharacters map
          const owKey = `${message.guild.id}-${owRollMessage.id}`;
          claimedCharacters.set(owKey, owRolledCharacter);

          // Decrease available rolls and update last roll time
          owUserData.rollsLeft -= 1;
          owUserData.lastRoll = owNow;
          cooldowns.set(owUserServerKey, owUserData);

          // Send remaining rolls message
          await message.channel.send(
            `🎲 You have **${owUserData.rollsLeft}/${rollsPerHour}** rolls remaining.`
          );
        }
        break;

      case 'pl': // Character List Command
        if (characters.length === 0) {
          return message.channel.send("No characters are available at the moment.");
        }

        // Pagination setup
        const itemsPerPage = 10; // Number of characters to display per page
        const totalPages = Math.ceil(characters.length / itemsPerPage);
        let currentPage = 1;

        // Function to generate the embed for a specific page
        const generateEmbed = (page) => {
          const start = (page - 1) * itemsPerPage;
          const end = page * itemsPerPage;
          const characterSubset = characters.slice(start, end);

          return new EmbedBuilder()
            .setTitle(`Available Characters (Page ${page}/${totalPages})`)
            .setColor(embedColor)
            .setDescription(
              characterSubset.map((character, index) => `**${start + index + 1}. ${character.name}**`).join("\n")
            )
            .setFooter({ text: "Character List" })
            .setTimestamp();
        };

        // Function to generate the navigation buttons
        const generateButtons = (page) => {
          return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev_page')
              .setLabel('✧˖°. Previous') // Add the "✧˖°." before the Rarity emoji
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 1)
              .setEmoji('<:Rarity_Pout:1331371364157751379>'), // Custom emoji for previous button
            new ButtonBuilder()
              .setCustomId('next_page')
              .setLabel('✧˖°. Next') // Add the "✧˖°." before the Fluttershy emoji
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === totalPages)
              .setEmoji('<:Fluttershy_Butterfly:1331118357570650214>'), // Custom emoji for next button
            new ButtonBuilder()
              .setLabel('The Magic of Friendship Grows ꨄ︎') // Your custom button label
              .setURL('https://i.imgur.com/EHp0piD.jpeg') // The custom link for the button
              .setStyle(ButtonStyle.Link) // Button style for external link
          );
        };

        // Send the initial embed with buttons
        const initialEmbed = generateEmbed(currentPage);
        const initialButtons = generateButtons(currentPage);

        const sentMessage = await message.channel.send({
          embeds: [initialEmbed],
          components: [initialButtons],
        });

        // Create a collector for button interactions with no timeout
        const collector = sentMessage.createMessageComponentCollector({
          filter: (interaction) => interaction.user.id === message.author.id,
        });

        collector.on('collect', async (interaction) => {
          if (interaction.customId === 'prev_page') {
            currentPage = Math.max(1, currentPage - 1);
          } else if (interaction.customId === 'next_page') {
            currentPage = Math.min(totalPages, currentPage + 1);
          }

          // Update the embed and buttons
          await interaction.update({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage)],
          });
        });

        collector.on('end', async () => {
          // Disable buttons after the collector ends (no timeout, only when you want to end)
          await sentMessage.edit({
            components: [],
          });
        });

        break;

      case 'or': // Show roll status command
        const prUserId = message.author.id;
        const prGuildId = message.guild.id;
        const prUserServerKey = `${prGuildId}-${prUserId}`;
        const prNow = Date.now();

        const userCooldown = cooldowns.get(prUserServerKey) || { lastRoll: 0, rollsLeft: rollsPerHour };
        const timeSinceLastRoll = prNow - userCooldown.lastRoll;
        
        // If cooldown period has passed, reset rolls
        if (timeSinceLastRoll >= rollWindow) {
          userCooldown.rollsLeft = rollsPerHour;
          userCooldown.lastRoll = 0; // Reset last roll time
        }

        const timeLeft = Math.max(0, rollWindow - timeSinceLastRoll);
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

        // Get claim count information
        const userClaimInfo = claimCounts.get(prUserServerKey) || { claims: 0, lastClaimTime: 0 };
        const claimsLeft = maxClaimsPerPeriod - userClaimInfo.claims;

        let statusMessage = `🎲 **Roll Status**\n`;
        statusMessage += `• Rolls remaining: **${userCooldown.rollsLeft}/${rollsPerHour}**\n`;
        statusMessage += `• Claims remaining: **${Math.max(0, claimsLeft)}/${maxClaimsPerPeriod}**\n`;
        
        if (timeLeft > 0 && userCooldown.rollsLeft < rollsPerHour) {
          statusMessage += `• Rolls reset in: **${minutesLeft}m ${secondsLeft}s**\n`;
        }
        
        message.channel.send(statusMessage);
        break;




      case 'r': // Rolls Remaining Command
        {
          const userIdForRolls = message.author.id;
          const guildId = message.guild.id;
          const userServerKey = `${guildId}-${userIdForRolls}`;
          
          // Check if the user has cooldown data
          const userCooldown = cooldowns.get(userServerKey) || { lastRoll: 0, rollsLeft: rollsPerHour };
          const timeSinceLastRoll = Date.now() - userCooldown.lastRoll;
          const rollsLeft = userCooldown.rollsLeft;

          // Calculate the remaining time until the next roll
          const timeLeft = rollWindow - timeSinceLastRoll;
          const minutesLeft = Math.floor(timeLeft / 60000);
          const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

          if (timeSinceLastRoll >= rollWindow) {
            message.channel.send(`You have **${rollsPerHour}/${rollsPerHour}** rolls available!`);
          } else {
            // Send message with how many rolls are left and the time remaining
            message.channel.send(
              `You have **${rollsLeft}/${rollsPerHour}** rolls left (can claim up to ${maxClaimsPerPeriod} characters). You can roll again in **${minutesLeft}m ${secondsLeft}s**.`
            );
          }
        }
        break;
    }
  });

  
  client.on('messageReactionAdd', async (reaction, user) => {

  // Ignore bot reactions or non-💖 reactions
  if (reaction.emoji.name !== '💖' || user.bot) return;

  // Only process reactions on messages sent by the bot and tracked in claimedCharacters
  if (!reaction.message.author || reaction.message.author.id !== client.user.id) return;

  const messageKey = `${reaction.message.guild.id}-${reaction.message.id}`;
  const character = claimedCharacters.get(messageKey); // Retrieve character info from the map

  // If no character is associated with the reaction, return
  if (!character) return;

    // Create a server-specific key for this character and user
    const serverCharacterKey = `${reaction.message.guild.id}-${character.name}`;
    const userClaimKey = `${reaction.message.guild.id}-${user.id}`;
    const now = Date.now();

    // Check claim limits
    if (claimCounts.has(userClaimKey)) {
      const userClaims = claimCounts.get(userClaimKey);
      const timeSinceLastClaim = now - userClaims.lastClaimTime;

      // If within cooldown period and already claimed max characters
      if (timeSinceLastClaim < rollWindow && userClaims.claims >= maxClaimsPerPeriod) {
        const timeLeft = rollWindow - timeSinceLastClaim;
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
        return reaction.message.channel.send(
          `You can only claim ${maxClaimsPerPeriod} characters per time period. Please wait ${minutesLeft} min ${secondsLeft} sec before claiming more characters.`
        );
      }

      // Reset claims if cooldown period has passed
      if (timeSinceLastClaim >= rollWindow) {
        userClaims.claims = 0;
        userClaims.lastClaimTime = now;
      }
    }

    // Check if this character is already claimed in this server
    if (serverCharacterOwnership.has(serverCharacterKey)) {
      const existingOwnerId = serverCharacterOwnership.get(serverCharacterKey);
      if (existingOwnerId) {
        const existingOwner = await client.users.fetch(existingOwnerId);
        return reaction.message.channel.send(
          `**${character.name}** has already been claimed by **${existingOwner.username}** in this server!`
        );
      }
    }

    // Prevent multiple claims by checking if the character has already been claimed
    if (reaction.message.embeds[0].description.includes('has claimed this character!')) return;

    // Create the updated embed with claim information
    const embedWithClaim = new EmbedBuilder()
      .setTitle(`**${character.name}**`)
      .setDescription(`${user.username} has claimed this character!`)
      .setImage(character.image)
      .setColor(embedColor)
      .setFooter({
        text: `Belongs to @${user.username}`,
        iconURL: user.avatarURL(), // User's avatar in the footer (top-right corner)
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true })) // User's avatar in the top-left corner
      .setTimestamp();

    // Edit the message with the claim
    await reaction.message.edit({ embeds: [embedWithClaim] });

    // Store the server-specific ownership
    serverCharacterOwnership.set(serverCharacterKey, user.id);

    // Update claim count for the user
    const userClaims = claimCounts.get(userClaimKey) || { claims: 0, lastClaimTime: now };
    userClaims.claims += 1;
    userClaims.lastClaimTime = now;
    claimCounts.set(userClaimKey, userClaims);

    // Send a single confirmation message for the user
    await reaction.message.channel.send(
      `**✨ ${user.username} & ${character.name} are now in love! 🥰✨**\n` +
      `You have claimed ${userClaims.claims}/${maxClaimsPerPeriod} characters in this time period.`
    );

    // Remove the claimed character from the messages map after it's claimed
    claimedCharacters.delete(messageKey);
  });
};