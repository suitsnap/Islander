const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge_team_channels")
    .setDescription("Removes all messages from the team channels"),

  async execute(interaction) {
    const teamchannels = [
      "1092171727892643922",
      "1093935763240001586",
      "1093935837521125506",
      "1093935500181651466",
      "1093711207837466644",
      "1093711316650315776",
      "1093711389228548316",
      "1093711610616492113",
      "1093711717931946034",
      "1093712245592170597",
    ];

    teamchannels.forEach(async (channel) => {
      const textChannel = await interaction.client.channels.fetch(channel);
      await textChannel.messages.fetch().then((messages) => {
        messages.forEach(async (message) => {
          await message.delete();
        });
      });
    });

    await interaction.reply({
      content: "All messages are being purged!",
      ephemeral: true,
    });
  },
};
