const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription('Replies with "Pong!"')
    .addBooleanOption((option) =>
      option
        .setName("websocket")
        .setDescription(
          "Ping for the websocket ping rather than the client ping."
        )
    ),
  async execute(interaction) {
    const websocketBool = interaction.options.get("websocket") ?? false;
    if (!websocketBool) {
      return await interaction.reply({
        content: `Pong! - Client: ${
          Date.now() - interaction.createdTimestamp
        }ms`,
        ephemeral: true,
      });
    } else {
      return await interaction.reply({
        content: `Pong! - Websocket: ${interaction.client.ws.ping}ms`,
        ephemeral: true,
      });
    }
  },
};
