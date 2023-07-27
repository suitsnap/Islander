const {
  SlashCommandBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

module.exports = {
  // Create Slash Command for Team Images
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("generate_team")
    .setDescription("Returns a 'Team Announcement' images as seen in MCC")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    // Subcommand for creating the team images using Discord avatars
    .addSubcommand((subcommand) =>
      subcommand
        .setName("with_discord")
        .setDescription(
          "Returns a 'Team Announcement' images using Discord avatars"
        )
        .addStringOption((option) =>
          option
            .setName("team")
            .setDescription("The name of the team for which the image is for")
            .setRequired(true)
            .addChoices(
              { name: "Red Rabbits", value: "RedRabbits.png" },
              { name: "Orange Ocelots", value: "OrangeOcelots.png" },
              { name: "Yellow Yaks", value: "YellowYaks.png" },
              { name: "Lime Llamas", value: "LimeLlamas.png" },
              { name: "Green Geckos", value: "GreenGeckos.png" },
              { name: "Cyan Coyotes", value: "CyanCoyotes.png" },
              { name: "Aqua Axolotls", value: "AquaAxolotls.png" },
              { name: "Blue Bats", value: "BlueBats.png" },
              { name: "Purple Pandas", value: "PurplePandas.png" },
              { name: "Pink Parrots", value: "PinkParrots.png" }
            )
        )
        .addUserOption((option) =>
          option
            .setName("user_one")
            .setDescription("The user who will be in Space #1")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user_two")
            .setDescription("The user who will be in Space #2")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user_three")
            .setDescription("The user who will be in Space #3")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user_four")
            .setDescription("The user who will be in Space #4")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("event_number")
            .setDescription(
              "The number in the top left and bottom right hand corner"
            )
        )
        .addAttachmentOption((option) =>
          option
            .setName("emblem")
            .setDescription(
              "Puts a small logo at the bottom of your team image."
            )
        )
    )
    // Subcommand for creating the team images using Minecraft skins
    .addSubcommand((subcommand) =>
      subcommand
        .setName("with_minecraft")
        .setDescription(
          "Returns a 'Team Announcement' images using Minecraft skins"
        )
        .addStringOption((option) =>
          option
            .setName("team")
            .setDescription("The name of the team for which the image is for")
            .setRequired(true)
            .addChoices(
              { name: "Red Rabbits", value: "RedRabbits.png" },
              { name: "Orange Ocelots", value: "OrangeOcelots.png" },
              { name: "Yellow Yaks", value: "YellowYaks.png" },
              { name: "Lime Llamas", value: "LimeLlamas.png" },
              { name: "Green Geckos", value: "GreenGeckos.png" },
              { name: "Cyan Coyotes", value: "CyanCoyotes.png" },
              { name: "Aqua Axolotls", value: "AquaAxolotls.png" },
              { name: "Blue Bats", value: "BlueBats.png" },
              { name: "Purple Pandas", value: "PurplePandas.png" },
              { name: "Pink Parrots", value: "PinkParrots.png" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("player_one")
            .setDescription(
              "The Minecraft IGN of the player who will be in Space #1"
            )
            .setRequired(true)
            .setMaxLength(16)
        )
        .addStringOption((option) =>
          option
            .setName("player_two")
            .setDescription(
              "The Minecraft IGN of the player who will be in Space #2"
            )
            .setRequired(true)
            .setMaxLength(16)
        )
        .addStringOption((option) =>
          option
            .setName("player_three")
            .setDescription(
              "The Minecraft IGN of the player who will be in Space #3"
            )
            .setRequired(true)
            .setMaxLength(16)
        )
        .addStringOption((option) =>
          option
            .setName("player_four")
            .setDescription(
              "The Minecraft IGN of the player will be in Space #4"
            )
            .setRequired(true)
            .setMaxLength(16)
        )
        .addIntegerOption((option) =>
          option
            .setName("event_number")
            .setDescription(
              "The number in the top left and bottom right hand corner"
            )
        )
        .addAttachmentOption((option) =>
          option
            .setName("emblem")
            .setDescription(
              "Puts a small logo at the bottom of your team image."
            )
        )
    )
    // Subcommand for creating the team images using custom images
    .addSubcommand((subcommand) =>
      subcommand
        .setName("with_custom")
        .setDescription(
          "Returns a 'Team Announcement' images with your own images and text."
        )
        .addAttachmentOption((option) =>
          option
            .setName("team_image")
            .setDescription("The background image for the team announcement.")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("image_one")
            .setDescription("The image for the person in Space #1")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("image_two")
            .setDescription("The image for the person in Space #2")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("image_three")
            .setDescription("The image for the person in Space #3")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("image_four")
            .setDescription("The image for the person in Space #4")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name_one")
            .setDescription("The name of the person who will be in Space #1")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name_two")
            .setDescription("The name of the person will be in Space #2")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name_three")
            .setDescription("The name of the person will be in Space #3")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name_four")
            .setDescription("The name of the person will be in Space #4")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("event_number")
            .setDescription(
              "The number in the top left and bottom right hand corner"
            )
        )
        .addAttachmentOption((option) =>
          option
            .setName("emblem")
            .setDescription(
              "Puts a small logo at the bottom of your team image."
            )
        )
    ),

  async execute(interaction) {
    GlobalFonts.registerFromPath("./src/fonts/Minecraft.ttf", "Minecraft");
    GlobalFonts.registerFromPath(
      "./src/fonts/Minecrafter.Reg.ttf",
      "MinecrafterFont"
    );
    await interaction.deferReply();
    try {
      if (interaction.options.getSubcommand() == "with_discord") {
        const teamFilename = interaction.options.getString("team");
        const userArray = [
          interaction.options.getUser("user_one"),
          interaction.options.getUser("user_two"),
          interaction.options.getUser("user_three"),
          interaction.options.getUser("user_four"),
        ];

        const eventNumber =
          interaction.options.getInteger("event_number") || " ";

        const canvas = createCanvas(1778, 1000);
        const context = canvas.getContext("2d");
        context.fillStyle = "#610111";
        context.textAlign = "center";
        context.textBaseline = "middle";

        const background = await loadImage(`./teamPhotos/${teamFilename}`);

        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const maxWidthOfText = 190;
        let i = 1;
        for (const user of userArray) {
          let fontSize = 40;
          let fontFamily = "Minecraft";

          context.font = `${fontSize}px ${fontFamily}`;

          let userAvatar = user.avatarURL({
            format: `png`,
            dynamic: false,
            size: 256,
          });

          if (userAvatar == null)
            userAvatar =
              "https://cdn.discordapp.com/attachments/1112755577685282846/1113600641760247899/incaseofermergency.png";

          const userLoadedAvatar = await loadImage(userAvatar);

          context.drawImage(userLoadedAvatar, 377 * i - 220, 310, 333, 333);

          const member = await interaction.guild.members.fetch(user.id);
          let nickname = member.displayName;
          nickname = nickname.charAt(0).toUpperCase() + nickname.slice(1);

          let textWidth = context.measureText(nickname).width;
          if (textWidth > maxWidthOfText) {
            const scale = maxWidthOfText / textWidth;
            const newFontSize = Math.floor(fontSize * scale);

            context.font = `${newFontSize}px ${fontFamily}`;
            textWidth = context.measureText(nickname).width;
          }
          context.fillText(nickname, 377 * i - 54, 714);
          if (i == 1) {
            context.font = `34px MinecrafterFont`;
            context.fillText(eventNumber.toString(), 108, 114);
            context.fillText(eventNumber.toString(), 1669, 894);
          }
          i++;
        }

        const recievedEmblem = interaction.options.getAttachment("emblem");

        if (recievedEmblem != null) {
          const targetWidth = 465;
          const targetHeight = 213;

          const imageFromCommand = await loadImage(recievedEmblem.proxyURL);

          const imageAspectRatio =
            imageFromCommand.width / imageFromCommand.height;
          let drawWidth = targetWidth;
          let drawHeight = targetWidth / imageAspectRatio;

          if (drawHeight > targetHeight) {
            drawHeight = targetHeight;
            drawWidth = targetHeight * imageAspectRatio;
          }
          const drawX = 660 + (targetWidth - drawWidth) / 2;
          const drawY = 787 + (targetHeight - drawHeight) / 2;

          context.drawImage(
            imageFromCommand,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        }

        const attachment = new AttachmentBuilder(await canvas.encode("png"), {
          name: teamFilename,
        });

        await interaction.editReply({ files: [attachment] });
      } else if (interaction.options.getSubcommand() == "with_minecraft") {
        const teamFilename = interaction.options.getString("team");
        const userArray = [
          interaction.options.getString("player_one"),
          interaction.options.getString("player_two"),
          interaction.options.getString("player_three"),
          interaction.options.getString("player_four"),
        ];

        const eventNumber =
          interaction.options.getInteger("event_number") || " ";

        const canvas = createCanvas(1778, 1000);
        const context = canvas.getContext("2d");
        context.fillStyle = "#610111";
        context.textAlign = "center";
        context.textBaseline = "middle";

        const background = await loadImage(`./teamPhotos/${teamFilename}`);

        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const maxWidthOfText = 190;
        let i = 1;
        for (const user of userArray) {
          let fontSize = 40;
          let fontFamily = "Minecraft";

          context.font = `${fontSize}px ${fontFamily}`;

          let userFace = `https://mc-heads.net/avatar/${user}`;

          const userLoadedAvatar = await loadImage(userFace);

          context.drawImage(userLoadedAvatar, 377 * i - 220, 310, 333, 333);

          let textWidth = context.measureText(user).width;
          if (textWidth > maxWidthOfText) {
            const scale = maxWidthOfText / textWidth;
            const newFontSize = Math.floor(fontSize * scale);

            context.font = `${newFontSize}px ${fontFamily}`;
            textWidth = context.measureText(user).width;
          }
          context.fillText(user, 377 * i - 54, 714);
          if (i == 1) {
            context.font = `34px MinecrafterFont`;
            context.fillText(eventNumber.toString(), 113, 114);
            context.fillText(eventNumber.toString(), 1672, 894);
          }
          i++;
        }

        const recievedEmblem = interaction.options.getAttachment("emblem");

        if (recievedEmblem != null) {
          const targetWidth = 465;
          const targetHeight = 213;

          const imageFromCommand = await loadImage(recievedEmblem.proxyURL);

          const imageAspectRatio =
            imageFromCommand.width / imageFromCommand.height;
          let drawWidth = targetWidth;
          let drawHeight = targetWidth / imageAspectRatio;

          if (drawHeight > targetHeight) {
            drawHeight = targetHeight;
            drawWidth = targetHeight * imageAspectRatio;
          }
          const drawX = 660 + (targetWidth - drawWidth) / 2;
          const drawY = 787 + (targetHeight - drawHeight) / 2;

          context.drawImage(
            imageFromCommand,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        }

        const attachment = new AttachmentBuilder(await canvas.encode("png"), {
          name: teamFilename,
        });

        await interaction.editReply({ files: [attachment] });
      } else if (interaction.options.getSubcommand() == "with_custom") {
        const teamImage = interaction.options.getAttachment("team_image");
        const userArray = [
          interaction.options.getString("name_one"),
          interaction.options.getString("name_two"),
          interaction.options.getString("name_three"),
          interaction.options.getString("name_four"),
        ];
        const imageArray = [
          interaction.options.getAttachment("image_one"),
          interaction.options.getAttachment("image_two"),
          interaction.options.getAttachment("image_three"),
          interaction.options.getAttachment("image_four"),
        ];

        const eventNumber =
          interaction.options.getInteger("event_number") || " ";

        const canvas = createCanvas(1778, 1000);
        const context = canvas.getContext("2d");
        context.fillStyle = "#610111";
        context.textAlign = "center";
        context.textBaseline = "middle";

        const background = await loadImage(teamImage.proxyURL);

        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        const maxWidthOfText = 190;

        let i = 1;
        for (const user of userArray) {
          let fontSize = 40;
          let fontFamily = "Minecraft";

          context.font = `${fontSize}px ${fontFamily}`;

          let userImage = imageArray[i - 1].proxyURL;
          const userLoadedAvatar = await loadImage(userImage);

          context.drawImage(userLoadedAvatar, 377 * i - 220, 310, 333, 333);

          let textWidth = context.measureText(user).width;
          if (textWidth > maxWidthOfText) {
            const scale = maxWidthOfText / textWidth;
            const newFontSize = Math.floor(fontSize * scale);

            context.font = `${newFontSize}px ${fontFamily}`;
            textWidth = context.measureText(user).width;
          }
          context.fillText(user, 377 * i - 54, 714);
          if (i == 1) {
            context.font = `34px MinecrafterFont`;
            context.fillText(eventNumber.toString(), 113, 114);
            context.fillText(eventNumber.toString(), 1672, 894);
          }
          i++;
        }
        const recievedEmblem = interaction.options.getAttachment("emblem");

        if (recievedEmblem != null) {
          const targetWidth = 465;
          const targetHeight = 213;

          const imageFromCommand = await loadImage(recievedEmblem.proxyURL);

          const imageAspectRatio =
            imageFromCommand.width / imageFromCommand.height;
          let drawWidth = targetWidth;
          let drawHeight = targetWidth / imageAspectRatio;

          if (drawHeight > targetHeight) {
            drawHeight = targetHeight;
            drawWidth = targetHeight * imageAspectRatio;
          }
          const drawX = 660 + (targetWidth - drawWidth) / 2;
          const drawY = 787 + (targetHeight - drawHeight) / 2;

          context.drawImage(
            imageFromCommand,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        }

        const attachment = new AttachmentBuilder(await canvas.encode("png"), {
          name: `teamImagefor${interaction.user.username}.png`,
        });

        await interaction.editReply({ files: [attachment] });
      }
    } catch (error) {
      await interaction.editReply({
        content: `Your command failed to execute. Please ensure all fields were entered correctly. Error: ${error}`,
      });
    }
  },
};
