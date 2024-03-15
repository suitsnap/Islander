const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Suggest a feature to add to the Islander")
        .addStringOption((option) => option
            .setName("suggestion")
            .setDescription("Suggest any idea you want, and I will do my best to implement it.")
            .setRequired(true))
        .addBooleanOption((option) => option
            .setName("anonymous")
            .setDescription("If you wish to suggest anonymously")), async execute(interaction) {
        const suggestion = interaction.options.get("suggestion").value;
        const anonymous = interaction.options.get("anonymous") ?? false;
        const user = anonymous ? "Anonymous" : interaction.user.username;

        const suggestEmbed = {
            title: "New Suggestion", fields: [{
                name: `Topic:`, value: suggestion, inline: false,
            },], footer: {text: `Created by ${user}`},
        };

        const suitsnapUser = await interaction.client.users.fetch("369238700489441280");
        await suitsnapUser.send({embeds: [suggestEmbed]});
        await interaction.reply({content: "Your suggestion has been submitted!", ephemeral: true});
    },
};
