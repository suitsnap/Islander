const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("team_initiate")
    .setDescription("Removes all messages from the team channels"),

  async execute(interaction) {
    interaction.reply({ content: "Sending now!", ephemeral: true });

    const channels = [
      {
        id: "1092171727892643922",
        role: "<@&1092166116157173860>",
        message:
          "https://discord.com/channels/1052015794395037776/1092160418270695564",
      },
      {
        id: "1093935763240001586",
        role: "<@&1092166991571337296>",
        message:
          "https://discord.com/channels/1052015794395037776/1092160481445289995",
      },
      {
        id: "1093935837521125506",
        role: "<@&1092171089632841878>",
        message:
          "https://discord.com/channels/1052015794395037776/1092160544485671073",
      },
      {
        id: "1093935500181651466",
        role: "<@&1092190734477709315>",
        message:
          "https://discord.com/channels/1052015794395037776/1092191134031302726",
      },
      {
        id: "1093711207837466644",
        role: "<@&1093708909925122059>",
        message:
          "https://discord.com/channels/1052015794395037776/1093713504969695282",
      },
      {
        id: "1093711316650315776",
        role: "<@&1093709536319254559>",
        message:
          "https://discord.com/channels/1052015794395037776/1093713641049698354",
      },
      {
        id: "1093711389228548316",
        role: "<@&1093709616241713192>",
        message:
          "https://discord.com/channels/1052015794395037776/1093713747324973158",
      },
      {
        id: "1093711610616492113",
        role: "<@&1093709718540795954>",
        message:
          "https://discord.com/channels/1052015794395037776/1093713826798653621",
      },
      {
        id: "1093711717931946034",
        role: "<@&1093709792012415067>",
        message:
          "https://discord.com/channels/1052015794395037776/1093713936739741746",
      },
      {
        id: "1093712245592170597",
        role: "<@&1093709868847870052>",
        message:
          "https://discord.com/channels/1052015794395037776/1093714001726283877",
      },
    ];

    for (const { id, role, message } of channels) {
      const channel = await interaction.client.channels.fetch(id);
      channel.send(
        `${role}, please check you can see this message and the voice channel: ${message}`
      );
    }
  },
};
