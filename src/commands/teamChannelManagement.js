const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
} = require("@discordjs/builders");
const { ButtonStyle } = require("discord-api-types/v9");
const teamChannelSchema = require("../schemas/teamChannelSchema");
const { model, Schema } = require("mongoose");
const { ChannelType } = require("discord.js");
const {
  getMostFrequentGuildIconColour,
} = require("../globalFunctions/getMostFrequentGuildIconColour");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("team_channel")
    .setDescription("Manage the team channels for your server.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add channels to your team channels list.")
        .addChannelOption((option) =>
          option
            .setName("team_text_channel")
            .setDescription("The team channel you are selecting.")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("team_role")
            .setDescription("The team role you are selecting.")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("team_voice_channel")
            .setDescription("The team VC you are selecting.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("view").setDescription("Create team channels for you.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ready")
        .setDescription("Send a ready check to all the teams in your list.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a team channel from your list.")
        .addIntegerOption((option) =>
          option
            .setName("team_index")
            .setDescription(
              "The team number that you wish to remove. Find with /team_channel view."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription(
          "Sends out an initial message that alerts players of their team channel(s)."
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("purge")
        .setDescription("Removes all messages from all team channels.")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "add":
        await addChannels(interaction);
        break;

      case "view":
        await viewChannels(interaction);
        break;

      case "ready":
        await readyCheck(interaction);
        break;

      case "remove":
        await removeChannels(interaction);
        break;

      case "info":
        await sendInfo(interaction);
        break;

      case "purge":
        await purgeChannels(interaction);
        break;
    }
  },
};

/**
 * @param {Discord.CommandInteraction} interaction
 */
async function addChannels(interaction) {
  const teamTextChannel = interaction.options.getChannel("team_text_channel");
  const teamRole = interaction.options.getRole("team_role");
  const teamVoiceChannel =
    interaction.options.getChannel("team_voice_channel") || null;

  if (
    teamTextChannel.type != ChannelType.GuildText ||
    (teamVoiceChannel != null &&
      teamVoiceChannel.type != ChannelType.GuildVoice)
  ) {
    return await interaction.reply({
      content: `Provided channels are not of the correct type.`,
      ephemeral: true,
    });
  }
  let teamChannels = await teamChannelSchema.findOne({
    guildId: interaction.guild.id,
  });

  if (teamChannels?.teams.length == 25 ?? false) {
    return await interaction.reply({
      content: `You have reached the maximum number of teams.`,
      ephemeral: true,
    });
  }

  const teamVoice = teamVoiceChannel ? teamVoiceChannel.id : null;

  const values = [teamTextChannel.id, teamRole.id, teamVoice];

  //Check if they have any data on the database already
  if (!teamChannels) {
    //If they don't, create a new document
    teamChannelSchema.create({
      guildId: interaction.guild.id,
      teams: values,
    });
  } else {
    //If they do, add the new channels to the list
    teamChannels.teams.push(values);
    await teamChannels.save();
  }

  //Create an embed field for the new team
  const newTeamEmbedField = {
    name: `Team ${teamChannels?.teams.length ?? 1}`,
    value: `Team Role:\n<@&${values[1]}>
    Text Channel:\n<#${values[0]}>\nVoice Channel:\n${
      values[2] ? `<#${values[2]}>` : "No Voice Channel"
    }`,
  };

  const guild = interaction.guild;
  const guildIconColour = await getMostFrequentGuildIconColour(guild);

  const embed = new EmbedBuilder()
    .setTitle("Team Channels")
    .setDescription(
      `Successfully added team channels for team ${
        teamChannels?.teams.length ?? 1
      }.`
    )
    .setColor(guildIconColour)
    .addFields(newTeamEmbedField);

  await interaction.reply({ embeds: [embed] });
}

/**
 * @param {Discord.CommandInteraction} interaction
 */
async function viewChannels(interaction) {
  //Create an embed with the list of channels
  const teamChannels = await teamChannelSchema.findOne({
    guildId: interaction.guild.id,
  });
  if (!teamChannels || teamChannels.teams.length == 0) {
    return await interaction.reply({
      content: `You don't have any team channels set up.`,
      ephemeral: true,
    });
  }

  //Create a system to get the first 5 teams. If there are more than 5 teams, add a button to go to the next page and so on.
  const guild = interaction.guild;
  const guildIconColour = await getMostFrequentGuildIconColour(guild);

  const teamList = teamChannels.teams.map((team) => {
    return {
      name: `Team ${teamChannels.teams.indexOf(team) + 1}`,
      value: `Team Role:\n<@&${team[1]}>\nText Channel:\n<#${
        team[0]
      }>\nVoice Channel:\n${team[2] ? `<#${team[2]}>` : "No Voice Channel"}`,
      inline: true,
    };
  });

  const embed = new EmbedBuilder()
    .setTitle("Team Channels")
    .setDescription(
      `Use the buttons below to navigate through the list of team channels.`
    )
    .setColor(guildIconColour)
    .addFields(teamList);

  await interaction.reply({
    embeds: [embed],
  });
}

/**
 * @param {Discord.CommandInteraction} interaction
 */
async function readyCheck(interaction) {
  //Check if they have any data on the database already
  const teamChannels = await teamChannelSchema.findOne({
    guildId: interaction.guild.id,
  });
  if (!teamChannels || teamChannels.teams.length == 0) {
    return await interaction.reply({
      content: `You don't have any team channels set up.`,
      ephemeral: true,
    });
  }

  const guild = interaction.guild;
  const guildIconColour = await getMostFrequentGuildIconColour(guild);

  const embed = new EmbedBuilder()
    .setTitle("Ready Check")
    .setDescription(`Are you ready?`)
    .setColor(guildIconColour);

  const readyButton = new ButtonBuilder({
    emoji: {
      id: "1089592997206835351",
      name: "yes",
    },
  })
    .setCustomId("ready")
    .setLabel("Ready")
    .setStyle(ButtonStyle.Primary);

  const notReadyButton = new ButtonBuilder({
    emoji: {
      id: "1089593104547446935",
      name: "no",
    },
  })
    .setCustomId("not_ready")
    .setLabel("Not Ready")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(readyButton, notReadyButton);

  //Send the embed and buttons to the all the team text channels
  teamChannels.teams.forEach((team) => {
    const channel = interaction.guild.channels.cache.get(team[0]);
    channel.send({
      content: `<@&${team[1]}>`,
      embeds: [embed],
      components: [row],
    });
  });

  await interaction.reply({
    content: `Ready check sent to all teams.`,
    ephemeral: true,
  });

  let responseCount = 0;
  let responseArray = [];
  let duplicateChecker = [];
  //Create a client listener for the buttons
  interaction.client.on("interactionCreate", async (buttonInteraction) => {
    if (buttonInteraction.isButton()) {
      let respondantTeam = teamChannels.teams.find((team) => {
        return team[0] == buttonInteraction.channelId;
      });
      if (duplicateChecker.includes(respondantTeam[0])) {
        return await buttonInteraction.reply({
          content: `You have already responded to the ready check.`,
          ephemeral: true,
        });
      }
      duplicateChecker.push(respondantTeam[0]);
      let respondantTeamName = `${
        interaction.guild.roles.cache.get(respondantTeam[1]).name
      }`;
      let respondantTeamStatus =
        buttonInteraction.customId == "ready" ? "ready" : "**not** ready";

      responseArray.push(`${respondantTeamName} are ${respondantTeamStatus}.`);

      if (buttonInteraction.customId == "ready") {
        await buttonInteraction.reply({
          content: `You have marked your team as ready.`,
        });
      } else if (buttonInteraction.customId == "not_ready") {
        await buttonInteraction.reply({
          content: `You have marked your team as not ready.`,
        });
      }
      responseCount++;
      if (responseCount == teamChannels.teams.length) {
        //Create an embed for the response
        const embed = new EmbedBuilder()
          .setTitle("Ready Check")
          .setDescription(responseArray.join("\n"))
          .setColor(guildIconColour);

        await interaction.channel.send({ embeds: [embed] });
      }
    }
  });
}

/**
 * @param {Discord.CommandInteraction} interaction
 */
async function removeChannels(interaction) {
  const teamIndex = interaction.options.getInteger("team_index");

  //Check if they have any data on the database already
  const teamChannels = await teamChannelSchema.findOne({
    guildId: interaction.guild.id,
  });
  if (!teamChannels || teamChannels.teams.length == 0) {
    return await interaction.reply({
      content: `You don't have any team channels set up.`,
      ephemeral: true,
    });
  }

  if (teamIndex < 1 || teamIndex > teamChannels.teams.length) {
    return await interaction.reply({
      content: `Invalid team index.`,
      ephemeral: true,
    });
  }

  teamChannels.teams.splice(teamIndex - 1, 1);
  await teamChannels.save();

  await interaction.reply({
    content: `Successfully removed team ${teamIndex}.`,
    ephemeral: true,
  });
}

/**
 * @param {Discord.CommandInteraction} interaction
 */
async function sendInfo(interaction) {
  //Check if they have any data on the database already
  const teamChannels = await teamChannelSchema.findOne({
    guildId: interaction.guild.id,
  });
  if (!teamChannels || teamChannels.teams.length == 0) {
    return await interaction.reply({
      content: `You don't have any team channels set up.`,
      ephemeral: true,
    });
  }

  const guild = interaction.guild;
  const guildIconColour = await getMostFrequentGuildIconColour(guild);

  const teamChannelsWithVcUrl = teamChannels.teams.map((team) => {
    return [team[0], team[1], team[2] ? `<#${team[2]}>`.trim() : null];
  });

  //Send the info message to all teams
  teamChannelsWithVcUrl.forEach((team) => {
    const message = team[2]
      ? `${interaction.guild.roles.cache.get(
          team[1]
        )}, please check you can see this message and the voice channel: ${
          team[2]
        }.`
      : `${interaction.guild.roles.cache.get(
          team[1]
        )}, please check you can see this message.`;

    const channel = interaction.guild.channels.cache.get(team[0]);
    channel.send({
      content: message,
    });
  });

  const embed = new EmbedBuilder()
    .setTitle("Team Channels")
    .setDescription(`Successfully sent out the info message to all teams.`)
    .setColor(guildIconColour);

  await interaction.reply({ embeds: [embed] });
}

/**
 * @param {Discord.CommandInteraction} interaction
 */
async function purgeChannels(interaction) {
  await interaction.deferReply({ ephemeral: true });

  //Check if they have any data on the database already
  const teamChannels = await teamChannelSchema.findOne({
    guildId: interaction.guild.id,
  });

  if (!teamChannels || teamChannels.teams.length == 0) {
    return await interaction.editReply({
      content: `You don't have any team channels set up.`,
      ephemeral: true,
    });
  }

  const guild = interaction.guild;
  const guildIconColour = await getMostFrequentGuildIconColour(guild);

  teamChannels.teams.forEach(async (team) => {
    const channel = interaction.guild.channels.cache.get(team[0]);
    let messages = await channel.messages.fetch();

    while (messages.size > 0) {
      const messageCount = messages.size;
      console.log(messageCount);
      await channel.bulkDelete(50, true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      messages = await channel.messages.fetch();
    }
  });

  teamChannels.teams.forEach(async (team) => {
    if (team[2] == null) return;
    const channel = interaction.guild.channels.cache.get(team[2]);
    let messages = await channel.messages.fetch();

    while (messages.size > 0) {
      const messageCount = messages.size;
      console.log(messageCount);
      await channel.bulkDelete(50, true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      messages = await channel.messages.fetch();
    }
  });

  const embed = new EmbedBuilder()
    .setTitle("Team Channels")
    .setDescription(
      `Purging all team channels. (This may take a while). If messages are older than 14 days, they will not be deleted.`
    )
    .setColor(guildIconColour);

  await interaction.editReply({ embeds: [embed] });
}
