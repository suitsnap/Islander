const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data : new SlashCommandBuilder()
    .setName("decision_dome")
    .setDescription("Starts the decision dome."),
  async execute(interaction) {
    await interaction.reply({ content: "Decision Dome is not yet implemented.", ephemeral: true });
    
  },
};