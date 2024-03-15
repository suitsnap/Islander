const {
    SlashCommandBuilder,
    AttachmentBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require("discord.js");
const {createCanvas, loadImage, GlobalFonts} = require("@napi-rs/canvas");

module.exports = {
    // Create Slash Command for Team Images
    cooldown: 10, data: new SlashCommandBuilder()
        .setName("generate_team")
        .setDescription("Returns a 'Team Announcement' images as seen in MCC")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        // Subcommand for creating the team images using Discord avatars
        .addSubcommand((subcommand) => subcommand
            .setName("with_discord")
            .setDescription("Returns a 'Team Announcement' images using Discord avatars")
            .addStringOption((option) => option
                .setName("team")
                .setDescription("The name of the team for which the image is for")
                .setRequired(true)
                .addChoices({name: "Red Rabbits", value: "RedRabbits.png"}, {
                    name: "Orange Ocelots",
                    value: "OrangeOcelots.png"
                }, {name: "Yellow Yaks", value: "YellowYaks.png"}, {
                    name: "Lime Llamas",
                    value: "LimeLlamas.png"
                }, {name: "Green Geckos", value: "GreenGeckos.png"}, {
                    name: "Cyan Coyotes",
                    value: "CyanCoyotes.png"
                }, {name: "Aqua Axolotls", value: "AquaAxolotls.png"}, {
                    name: "Blue Bats",
                    value: "BlueBats.png"
                }, {name: "Purple Pandas", value: "PurplePandas.png"}, {
                    name: "Pink Parrots",
                    value: "PinkParrots.png"
                }))
            .addUserOption((option) => option
                .setName("user_one")
                .setDescription("The user who will be in Space #1")
                .setRequired(true))
            .addUserOption((option) => option
                .setName("user_two")
                .setDescription("The user who will be in Space #2")
                .setRequired(true))
            .addUserOption((option) => option
                .setName("user_three")
                .setDescription("The user who will be in Space #3")
                .setRequired(true))
            .addUserOption((option) => option
                .setName("user_four")
                .setDescription("The user who will be in Space #4")
                .setRequired(true))
            .addIntegerOption((option) => option
                .setName("event_number")
                .setDescription("The number in the top left and bottom right hand corner"))
            .addAttachmentOption((option) => option
                .setName("emblem")
                .setDescription("Puts a small logo at the bottom of your team image."))
            .addBooleanOption((option) => option
                .setName("name_override")
                .setDescription("Allows you to override the names in the image with your own text.")))
        // Subcommand for creating the team images using Minecraft skins
        .addSubcommand((subcommand) => subcommand
            .setName("with_minecraft")
            .setDescription("Returns a 'Team Announcement' images using Minecraft skins")
            .addStringOption((option) => option
                .setName("team")
                .setDescription("The name of the team for which the image is for")
                .setRequired(true)
                .addChoices({name: "Red Rabbits", value: "RedRabbits.png"}, {
                    name: "Orange Ocelots",
                    value: "OrangeOcelots.png"
                }, {name: "Yellow Yaks", value: "YellowYaks.png"}, {
                    name: "Lime Llamas",
                    value: "LimeLlamas.png"
                }, {name: "Green Geckos", value: "GreenGeckos.png"}, {
                    name: "Cyan Coyotes",
                    value: "CyanCoyotes.png"
                }, {name: "Aqua Axolotls", value: "AquaAxolotls.png"}, {
                    name: "Blue Bats",
                    value: "BlueBats.png"
                }, {name: "Purple Pandas", value: "PurplePandas.png"}, {
                    name: "Pink Parrots",
                    value: "PinkParrots.png"
                }))
            .addStringOption((option) => option
                .setName("player_one")
                .setDescription("The Minecraft IGN of the player who will be in Space #1")
                .setRequired(true)
                .setMaxLength(16))
            .addStringOption((option) => option
                .setName("player_two")
                .setDescription("The Minecraft IGN of the player who will be in Space #2")
                .setRequired(true)
                .setMaxLength(16))
            .addStringOption((option) => option
                .setName("player_three")
                .setDescription("The Minecraft IGN of the player who will be in Space #3")
                .setRequired(true)
                .setMaxLength(16))
            .addStringOption((option) => option
                .setName("player_four")
                .setDescription("The Minecraft IGN of the player will be in Space #4")
                .setRequired(true)
                .setMaxLength(16))
            .addIntegerOption((option) => option
                .setName("event_number")
                .setDescription("The number in the top left and bottom right hand corner"))
            .addAttachmentOption((option) => option
                .setName("emblem")
                .setDescription("Puts a small logo at the bottom of your team image.")))
        // Subcommand for creating the team images using custom images
        .addSubcommand((subcommand) => subcommand
            .setName("with_custom")
            .setDescription("Returns a 'Team Announcement' images with your own images and text.")
            .addAttachmentOption((option) => option
                .setName("team_image")
                .setDescription("The background image for the team announcement.")
                .setRequired(true))
            .addAttachmentOption((option) => option
                .setName("image_one")
                .setDescription("The image for the person in Space #1")
                .setRequired(true))
            .addAttachmentOption((option) => option
                .setName("image_two")
                .setDescription("The image for the person in Space #2")
                .setRequired(true))
            .addAttachmentOption((option) => option
                .setName("image_three")
                .setDescription("The image for the person in Space #3")
                .setRequired(true))
            .addAttachmentOption((option) => option
                .setName("image_four")
                .setDescription("The image for the person in Space #4")
                .setRequired(true))
            .addStringOption((option) => option
                .setName("name_one")
                .setDescription("The name of the person who will be in Space #1")
                .setRequired(true))
            .addStringOption((option) => option
                .setName("name_two")
                .setDescription("The name of the person will be in Space #2")
                .setRequired(true))
            .addStringOption((option) => option
                .setName("name_three")
                .setDescription("The name of the person will be in Space #3")
                .setRequired(true))
            .addStringOption((option) => option
                .setName("name_four")
                .setDescription("The name of the person will be in Space #4")
                .setRequired(true))
            .addIntegerOption((option) => option
                .setName("event_number")
                .setDescription("The number in the top left and bottom right hand corner"))
            .addAttachmentOption((option) => option
                .setName("emblem")
                .setDescription("Puts a small logo at the bottom of your team image."))),

    async execute(interaction) {
        GlobalFonts.registerFromPath("./src/fonts/Minecraft.ttf", "Minecraft");
        GlobalFonts.registerFromPath("./src/fonts/Minecrafter.Reg.ttf", "MinecrafterFont");

        const override = interaction.options.getBoolean("name_override");
        if (!override) {
            await interaction.deferReply();
        }

        const attachment = interaction.options.getAttachment("emblem");
        if (attachment && (!attachment.contentType || !attachment.contentType.startsWith("image/"))) {
            await interaction.editReply({
                content: "The emblem must be an image file!",
            });
            return;
        }

        if (interaction.options.getSubcommand() === "with_discord") {
            const teamFilename = interaction.options.getString("team");
            const userArray = [interaction.options.getUser("user_one"), interaction.options.getUser("user_two"), interaction.options.getUser("user_three"), interaction.options.getUser("user_four"),];

            const imageArray = userArray.map((user) => {
                return user.displayAvatarURL({
                    format: "png", dynamic: false, size: 256,
                }); // Take a shot if this errors
            });

            if (override) {
                const nameOverrideModal = createModal(userArray);
                await interaction.showModal(nameOverrideModal);

                interaction.client.on("interactionCreate", async (modalInteraction) => {
                    if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== "nameOverrideModal" || modalInteraction.user.id !== interaction.user.id) return;

                    const modalUserArray = [modalInteraction.fields.getTextInputValue("player1Input"), modalInteraction.fields.getTextInputValue("player2Input"), modalInteraction.fields.getTextInputValue("player3Input"), modalInteraction.fields.getTextInputValue("player4Input"),];

                    const eventNumber = interaction.options.getInteger("event_number") || " ";

                    await createCard(modalInteraction, modalUserArray, imageArray, `./src/teamPhotos/${teamFilename}`, teamFilename, eventNumber, attachment);
                });
            } else {
                const nameArray = userArray.map((user) => {
                    return user.username;
                });

                const eventNumber = interaction.options.getInteger("event_number") || " ";

                await createCard(interaction, nameArray, imageArray, `./src/teamPhotos/${teamFilename}`, teamFilename, eventNumber, attachment);
            }
        } else if (interaction.options.getSubcommand() === "with_minecraft") {
            const teamFilename = interaction.options.getString("team");
            const userArray = [interaction.options.getString("player_one"), interaction.options.getString("player_two"), interaction.options.getString("player_three"), interaction.options.getString("player_four"),];

            //Fetch the uuids and the correctly formmated usernames of the players using the mojang api and put them in 2 arrays
            const userArrayResponse = await Promise.all(userArray.map(async (user) => {
                const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${user}`);
                const data = await response.json();
                return {id: data.id, name: data.name};
            }));

            const uuidArray = userArrayResponse.map((user) => user.id);
            const nameArray = userArrayResponse.map((user) => user.name);

            const headArray = uuidArray.map((user) => {
                return `https://mc-heads.net/avatar/${user}`;
            });

            const eventNumber = interaction.options.getInteger("event_number") || " ";

            await createCard(interaction, nameArray, headArray, `./src/teamPhotos/${teamFilename}`, teamFilename, eventNumber, attachment);
        } else if (interaction.options.getSubcommand() === "with_custom") {
            const teamImage = interaction.options.getAttachment("team_image");
            const userArray = [interaction.options.getString("name_one"), interaction.options.getString("name_two"), interaction.options.getString("name_three"), interaction.options.getString("name_four"),];
            const imageArray = [interaction.options.getAttachment("image_one").proxyURL, interaction.options.getAttachment("image_two").proxyURL, interaction.options.getAttachment("image_three").proxyURL, interaction.options.getAttachment("image_four").proxyURL,];

            const eventNumber = interaction.options.getInteger("event_number") || " ";

            await createCard(interaction, userArray, imageArray, teamImage.proxyURL, `TeamImageFor${interaction.user.username}.png`, eventNumber, attachment);
        }
    },
};

/**
 * Creates a team announcement image
 * @param {Discord.Interaction} interaction The interaction that triggered the command
 * @param {string[]} nameArray The array of names to be displayed on the image
 * @param {string[]} imageArray The array of images to be displayed on the image
 * @param {string} background The background image for the team announcement
 * @param {string} teamFilename The filename for the team announcement image
 * @param {string} eventNumber The event number to be displayed on the image
 * @param {Discord.Attachment} recievedEmblem The emblem to be displayed on the image
 * */
async function createCard(interaction, nameArray, imageArray, background, teamFilename, eventNumber = "", recievedEmblem = null) {
    console.log(nameArray);

    const canvas = createCanvas(1778, 1000);
    const context = canvas.getContext("2d");

    context.fillStyle = "#610111";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const loadedBackground = await loadImage(background);
    context.drawImage(loadedBackground, 0, 0, canvas.width, canvas.height);

    const maxWidthOfText = 190;

    let i = 1;
    for (const name of nameArray) {
        console.log(name);
        let fontSize = 40;
        let fontFamily = "Minecraft";
        context.font = `${fontSize}px ${fontFamily}`;

        let userImage = imageArray[i - 1];
        const loadedImage = await loadImage(userImage);
        context.drawImage(loadedImage, 377 * i - 220, 310, 333, 333);

        let textWidth = context.measureText(name).width;
        if (textWidth > maxWidthOfText) {
            const scale = maxWidthOfText / textWidth;
            const newFontSize = Math.floor(fontSize * scale);
            context.font = `${newFontSize}px ${fontFamily}`;
            textWidth = context.measureText(name).width;
        }
        context.fillText(name, 377 * i - 54, 714);
        if (i === 1) {
            context.font = `34px MinecrafterFont`;
            context.fillText(eventNumber.toString(), 113, 114);
            context.fillText(eventNumber.toString(), 1672, 894);
        }
        i++;
    }

    if (recievedEmblem != null) {
        const targetWidth = 465;
        const targetHeight = 213;

        const imageFromCommand = await loadImage(recievedEmblem.proxyURL);

        const imageAspectRatio = imageFromCommand.width / imageFromCommand.height;
        let drawWidth = targetWidth;
        let drawHeight = targetWidth / imageAspectRatio;

        if (drawHeight > targetHeight) {
            drawHeight = targetHeight;
            drawWidth = targetHeight * imageAspectRatio;
        }
        const drawX = 660 + (targetWidth - drawWidth) / 2;
        const drawY = 787 + (targetHeight - drawHeight) / 2;

        context.drawImage(imageFromCommand, drawX, drawY, drawWidth, drawHeight);
    }

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
        name: teamFilename,
    });

    if (interaction.isCommand()) {
        return await interaction.editReply({files: [attachment]});
    } else {
        return await interaction.reply({files: [attachment]});
    }
}

function createModal(userArray) {
    const nameOverrideModal = new ModalBuilder()
        .setCustomId("nameOverrideModal")
        .setTitle("Name Override Modal");

    const inputFields = [];

    for (let i = 0; i < 4; i++) {
        const inputField = new TextInputBuilder()
            .setCustomId(`player${i + 1}Input`)
            .setValue(userArray[i].username)
            .setLabel(`Player ${i + 1}'s Name`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(20);

        inputFields.push(inputField);
    }

    const actionRows = inputFields.map((inputField) => new ActionRowBuilder().addComponents(inputField));
    nameOverrideModal.addComponents(...actionRows);
    return nameOverrideModal;
}
