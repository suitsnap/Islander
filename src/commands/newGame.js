const {SlashCommandBuilder} = require("@discordjs/builders");
const gameSchema = require("../schemas/gameSchema");


/**
 * Creates a command to handle team making. Just makes my job a bit easier innit.
 * @type {{data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">, execute(*): Promise<*|undefined>}}
 */

/**
 * @typedef {Object} game
 * @property {function} save
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("add_game")
        .setDescription("Adds a game to the database.")
        .addStringOption((option) => option
            .setName("name")
            .setDescription("The name of the game.")
            .setRequired(true))
        .addStringOption((option) => option
            .setName("colour")
            .setDescription("The colour of the game.")
            .setRequired(true))
        .addStringOption((option) => option
            .setName("emoji")
            .setDescription("The emoji of the game.")
            .setRequired(true))
        .addStringOption((option) => option
            .setName("thumbnail")
            .setDescription("The thumbnail of the game.")
            .setRequired(true))
        .addStringOption((option) => option
            .setName("value")
            .setDescription("The value of the game.")
            .setRequired(true)), async execute(interaction) {
        if (interaction.user.id !== "369238700489441280") {
            return await interaction.reply({
                content: "Unfortunately, you are not SuitSnap and so cannot use this command.", ephemeral: true,
            });
        }

        const name = interaction.options.getString("name");
        const colour = interaction.options.getString("colour");
        const emoji = interaction.options.getString("emoji");
        const thumbnail = interaction.options.getString("thumbnail");
        const value = interaction.options.getString("value");

        const game = new gameSchema({
            name: name, colour: colour, emoji: emoji, thumbnail: thumbnail, value: value,
        });

        await game.save();
        await interaction.reply({
            content: `Game ${name} has been added to the database.`, ephemeral: true,
        });
    },
};
