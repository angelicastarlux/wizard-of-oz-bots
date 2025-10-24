const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,  // Ensures the event runs only once when the bot is ready
  async execute(client) {
    // Log to ensure this code is running
    console.log('Bot is ready!');

    try {
      // Set the bot's activity to "Playing with Wizard of Oz characters"
      await client.user.setActivity('🌪️ in the Land of Oz 🏰', {
        type: ActivityType.PLAYING,  // You can change this to WATCHING, LISTENING, etc.
      });
      console.log('Bot status updated successfully!');
    } catch (error) {
      // Catch and log any errors when updating the activity
      console.error('Error setting bot activity:', error);
    }
  },
};