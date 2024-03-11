const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Replies with "Pong!"')
        .addBooleanOption((option) => option
            .setName("websocket")
            .setDescription("Ping for the websocket ping rather than the client ping.")), async execute(interaction) {
        const isWebsocket = interaction.options.getBoolean("websocket") || false;
        const content = isWebsocket ? `Pong! - Websocket: ${interaction.client.ws.ping}ms` : `Pong! - Client: ${Date.now() - interaction.createdTimestamp}ms`;

        await interaction.reply({content, ephemeral: true});
    },
};
