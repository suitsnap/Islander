const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fetch = require("isomorphic-fetch");
const PermissionFlagsBits = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retrieve_icon")
    .setDescription(
      "Gets a downloadable version of one or four people's icons."
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName("minecraft")
        .setDescription("Retrieve Minecraft icons.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("single")
            .setDescription("Returns someone's Minecraft face.")
            .addStringOption((option) =>
              option
                .setName("player")
                .setDescription("The player you want the face of.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("quad")
            .setDescription("Returns the faces of 4 players")
            .addStringOption((option) =>
              option
                .setName("player_one")
                .setDescription(
                  "The first user of whose Minecraft face you want."
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("player_two")
                .setDescription(
                  "The second user of whose Minecraft face you want."
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("player_three")
                .setDescription(
                  "The third user of whose Minecraft face you want."
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("player_four")
                .setDescription(
                  "The fourth user of whose Minecraft face you want."
                )
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName("discord")
        .setDescription("Retrieve Discord icons.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("single")
            .setDescription("Returns someone's Discord profile picture.")
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user you want the profile picture of.")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("image_format_solo")
                .setDescription("The file format of the image - default: .png")
                .addChoices(
                  { name: "PNG", value: "png" },
                  { name: "WEBP", value: "webp" },
                  { name: "JPEG", value: "jpeg" }
                )
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("quad")
            .setDescription("Returns the profile pictures of 4 users")
            .addUserOption((option) =>
              option
                .setName("user_one")
                .setDescription(
                  "The first user of whose profile picture you want."
                )
                .setRequired(true)
            )
            .addUserOption((option) =>
              option
                .setName("user_two")
                .setDescription(
                  "The second user of whose profile picture you want."
                )
                .setRequired(true)
            )
            .addUserOption((option) =>
              option
                .setName("user_three")
                .setDescription(
                  "The third user of whose profile picture you want."
                )
                .setRequired(true)
            )
            .addUserOption((option) =>
              option
                .setName("user_four")
                .setDescription(
                  "The fourth user of whose profile picture you want."
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("image_format_quad")
                .setDescription("The file format of the image - default: .png")
                .addChoices(
                  { name: "PNG", value: "png" },
                  { name: "WEBP", value: "webp" },
                  { name: "JPEG", value: "jpeg" }
                )
            )
        )
    ),
  async execute(interaction) {
    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();
    let regex = /[^a-zA-Z0-9]/g;

    if (subcommandGroup === "discord") {
      if (subcommand === "single") {
        const user = interaction.options.getUser("user");
        const formatOfPhoto =
          interaction.options.getString("image_format_solo") || "png";
        await processAvatar(interaction, user, formatOfPhoto, regex);
      } else if (subcommand === "quad") {
        const userArray = [
          interaction.options.getUser("user_one"),
          interaction.options.getUser("user_two"),
          interaction.options.getUser("user_three"),
          interaction.options.getUser("user_four"),
        ];
        const formatOfPhoto =
          interaction.options.getString("image_format_quad") || "png";
        await processAvatarGroup(interaction, userArray, formatOfPhoto, regex);
      }
    } else if (subcommandGroup === "minecraft") {
      if (subcommand === "single") {
        const player = interaction.options.getString("player");
        await processMinecraftAvatar(interaction, player, regex);
      } else if (subcommand === "quad") {
        const playerArray = [
          interaction.options.getString("player_one"),
          interaction.options.getString("player_two"),
          interaction.options.getString("player_three"),
          interaction.options.getString("player_four"),
        ];
        await processMinecraftAvatarGroup(interaction, playerArray, regex);
      }
    }
  },
};

async function processAvatar(interaction, user, formatOfPhoto, regex) {
  if (!user.avatar) {
    return interaction.reply("User does not have an avatar.");
  }

  const avatarUrl = user.avatarURL({
    format: formatOfPhoto,
    dynamic: true,
    size: 4096,
  });

  try {
    const response = await fetch(avatarUrl);
    const buffer = await response.buffer();

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    const image = await loadImage(buffer);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const attachment = new Discord.AttachmentBuilder(
      await canvas.encode(formatOfPhoto),
      { name: `avatarOf${user.username.replace(regex, "")}.${formatOfPhoto}` }
    );

    interaction.reply({ files: [attachment] });
  } catch (error) {
    console.error("Error while processing the avatar image:", error);
    interaction.reply("Failed to retrieve the user's avatar.");
  }
}

async function processAvatarGroup(
  interaction,
  userArray,
  formatOfPhoto,
  regex
) {
  const attachmentList = [];
  let edgeCaseMessage = "";

  for (const user of userArray) {
    if (!user.avatar) {
      edgeCaseMessage += `${user.username} does not have an avatar.\n`;
    } else {
      const avatarUrl = user.avatarURL({
        format: formatOfPhoto,
        dynamic: true,
        size: 4096,
      });

      const canvas = createCanvas(512, 512);
      const context = canvas.getContext("2d");

      const image = await loadImage(avatarUrl);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const attachment = new Discord.AttachmentBuilder(
        await canvas.encode(formatOfPhoto),
        { name: `avatarOf${user.username.replace(regex, "")}.${formatOfPhoto}` }
      );

      attachmentList.push(attachment);
    }
  }
  interaction.reply({ content: edgeCaseMessage, files: attachmentList });
}

async function processMinecraftAvatar(interaction, player, regex) {
  const avatarUrl = `https://mc-heads.net/avatar/${player}/4096`;

  try {
    const response = await fetch(avatarUrl);
    const buffer = await response.buffer();

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    const image = await loadImage(buffer);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const attachment = new Discord.AttachmentBuilder(
      await canvas.encode("png"),
      { name: `avatarOf${player.replace(regex, "")}.png` }
    );

    interaction.reply({ files: [attachment] });
  } catch (error) {
    console.error("Error while processing the avatar image:", error);
    interaction.reply("Failed to retrieve the user's avatar.");
  }
}

async function processMinecraftAvatarGroup(interaction, playerArray, regex) {
  const attachmentList = [];

  for (const player of playerArray) {
    const avatarUrl = `https://mc-heads.net/avatar/${player}/4096`;

    const canvas = createCanvas(512, 512);
    const context = canvas.getContext("2d");

    const image = await loadImage(avatarUrl);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const attachment = new Discord.AttachmentBuilder(
      await canvas.encode("png"),
      { name: `avatarOf${player.replace(regex, "")}.png` }
    );

    attachmentList.push(attachment);
  }
  interaction.reply({ files: attachmentList });
}
