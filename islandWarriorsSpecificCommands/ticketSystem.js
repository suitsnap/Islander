const { SlashCommandBuilder, ButtonBuilder } = require("discord.js");
const { EmbedBuilder, ActionRowBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket_begin")
    .setDescription("Create and send the message for the ticket system."),

  async execute(interaction) {
    // Create button
    const ticketButton = new ButtonBuilder()
      .setStyle(1)
      .setLabel("📩")
      .setCustomId("ticket-button");

    const row = new ActionRowBuilder().addComponents(ticketButton);
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle("Tickets")
      .setColor(0xd60000)
      .setDescription(
        "This is used to open a ticket if you have any problems whether that be during a tournament or signing up, anything you have a problem with (relating to this server).\n To open a ticket click the button with the emoji '📩' and navigate to the channel specific to you!"
      )
      .setFooter({
        text: "Made by SuitSnap",
        iconURL:
          "https://static-cdn.jtvnw.net/jtv_user_pictures/6df3a537-0cc0-41f0-b074-04eb81c7589f-profile_image-70x70.png",
      });
    // Send message
    await interaction.reply({ content: "Message sent!", ephemeral: true });
    await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });
  },
};
