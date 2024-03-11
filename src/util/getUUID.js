const {EmbedBuilder} = require("discord.js");
const { sanitiseUsername } = require("./sanitiseUsername");

async function getUUID(username, interaction) {
    const apiUrl = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.errorMessage) {
        const unknownEmbed = new EmbedBuilder()
            .setTitle("Unknown Minecraft account")
            .setThumbnail(`https://cdn.suitsnap.tech/assets/questionLarge.png`)
            .setDescription(`The username \`${sanitiseUsername(username)}\` does not exist.`)
            .setColor(0x058fd0);

        return await interaction.reply({embeds: [unknownEmbed], ephemeral: true});
    }
    const undashedUUID = data.id;
    const formatUUID = (uuid) => uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    return formatUUID(undashedUUID);
}