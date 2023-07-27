const { ChannelType, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder } = require("discord.js");

function ticketButton(buttonInteraction) {
  buttonInteraction.deferReply({ ephemeral: true });
  const category = buttonInteraction.client.channels.cache.get(
    "1054887073884151898"
  );
  const channelName = "ticket-" + buttonInteraction.user.username.toLowerCase();
  buttonInteraction.guild.channels
    .create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        {
          id: buttonInteraction.guild.id,
          deny: PermissionFlagsBits.ViewChannel,
        },
        {
          id: "1105256862670127196",
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
          ],
        },
        {
          id: buttonInteraction.member,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
          ],
        },
      ],
    })
    .then((textChannel) => {
      const channelID = textChannel.id;
      buttonInteraction.followUp(
        "Ticket created! Please go to: " + `<#${channelID}>`
      );
      setTimeout(() => {
        const closeButton = new ButtonBuilder()
          .setStyle(4)
          .setLabel("\uD83D\uDD12 Close ticket")
          .setCustomId("close-button");
        const pingButton = new ButtonBuilder()
          .setStyle(2)
          .setLabel("Ping staff")
          .setEmoji("1115052247626305636")
          .setCustomId("ping-button");

        const row = new ActionRowBuilder().addComponents(
          closeButton,
          pingButton
        );
        textChannel.send({
          content: `Hi there, ${buttonInteraction.user.toString()}, welcome to your ticket! Here, staff can provide any necessary information or help! Once you are ready to close the ticket, just press the button below!`,
          components: [row],
        });
      }, 500);
    });
}

module.exports = { ticketButton };
