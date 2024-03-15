const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
} = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const gameSchema = require("../schemas/gameSchema");
const {generatePollBars} = require("../util/generatePollBars");
const {
    getMostFrequentGuildIconColour,
} = require("../util/getMostFrequentGuildIconColour");

module.exports = {
    cooldown: 30, //Create the vote command
    data: new SlashCommandBuilder()
        .setName(`begin_vote`)
        .setDescription(`Begins the voting for which game you wish to play next!`)
        .setDMPermission(false)
        .addStringOption((option) => option
            .setName(`title`)
            .setDescription(`The title of the voting poll`)
            .setRequired(true))
        .addIntegerOption((option) => option
            .setName(`duration`)
            .setDescription(`The duration of the poll, in minutes`)
            .setRequired(true))
        .addStringOption((option) => option
            .setName(`ending`)
            .setDescription(`Determines the ending of the vote.`)
            .addChoices({
                name: "Normal", value: "normal",
            }, {
                name: "Totals", value: "totals",
            }, {
                name: "Nothing", value: "nothing",
            }, {
                name: "Weighted (not functional currently)", value: "weighted",
            }, {
                name: "Random - troll kekw", value: "random",
            })
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addRoleOption((option) => option
            .setName(`role`)
            .setDescription(`Option role that restricts who can vote`)), async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        await interaction.editReply("Please wait...");

        //Define main variables from options of command
        const title = interaction.options.get("title").value;
        const duration = interaction.options.get("duration").value;

        const ending = interaction.options.get("ending").value;

        const roleID = interaction.options.get("role") ?? null;

        //Get the average colour of the guild PFP for the embeds' colour
        const guild = interaction.guild;
        const guildIconColour = await getMostFrequentGuildIconColour(guild);

        const generatedPollId = await generatePollId();
        if (generatedPollId === "Error generating poll ID.") {
            await interaction.reply(generatedPollId);
        }
        //Create the select menu for the games from the database
        const games = await gameSchema.find();
        let options = games.map((game) => {
            return {
                label: game.name, value: game.value, emoji: game.emoji,
            };
        });

        //Filter out games that have any fields undefined
        options = options.filter((option) => option.label !== undefined && option.value !== undefined && option.emoji !== undefined);

        const gameSelect = new StringSelectMenuBuilder()
            .setCustomId(`gameSelect-${generatedPollId}`)
            .setPlaceholder(`Choose your games!`)
            .setMinValues(1)
            .setMaxValues(6)
            .addOptions(...options.map((option) => new StringSelectMenuOptionBuilder()
                .setLabel(option.label)
                .setDescription(`Will ${option.label} be in this vote?`)
                .setValue(option.value)
                .setEmoji(option.emoji)
                .setDefault(false)));

        const gameSelectRow = new ActionRowBuilder().addComponents(gameSelect);

        //Edit the initial message to include the select menu
        await interaction.editReply({
            content: `Please select the games you wish to play!`, components: [gameSelectRow],
        });

        //Create a collector for the select menu
        const filter = (interaction) => interaction.customId === `gameSelect-${generatedPollId}`;
        const collector = interaction.channel.createMessageComponentCollector({
            filter, time: duration * 60000,
        });

        //Once the collector has been triggered, create a list of whethere each of the games has been selected
        collector.on("collect", async (interactionCollector) => {
            //Delete the initial message
            await interaction.deleteReply();
            const selectedOptions = interactionCollector.values;
            const selectedGames = options.filter((option) => selectedOptions.includes(option.value));
            const votingOptions = [selectedOptions.includes("battleBox"), selectedOptions.includes("dynaball"), selectedOptions.includes("holeInTheWall"), selectedOptions.includes("parkourWarriorSurvivor"), selectedOptions.includes("skyBattle"), selectedOptions.includes("toGetToTheOtherSide"),];

            await interactionCollector.reply({
                content: `Sending vote for ${selectedGames
                    .map((game) => game.label)
                    .join(", ")}!`, ephemeral: true,
            });

            //Get the Unix-Discord syntax for when the poll ends
            const pollEndTime = new Date();
            pollEndTime.setMinutes(pollEndTime.getMinutes() + duration);
            const pollEndTimeString = `<t:${Math.floor(pollEndTime.getTime() / 1000)}:R>`;

            let pollEmbed = new EmbedBuilder()
                .setColor(guildIconColour)
                .setTitle(title)
                .addFields({
                    name: `Details`, value: `Poll ends ${[pollEndTimeString]}`, inline: false,
                })
                .setFooter({
                    text: `Poll ID: ${generatedPollId} | Created by: ${interactionCollector.user.username}`,
                    iconURl: interactionCollector.user.iconURL,
                });

            //Create list of all the relevant reaction emojis for this vote
            let reactionEmojis = [];
            if (votingOptions[0]) {
                reactionEmojis.push(options[0].emoji);
            }
            if (votingOptions[1]) {
                reactionEmojis.push(options[1].emoji);
            }
            if (votingOptions[2]) {
                reactionEmojis.push(options[2].emoji);
            }
            if (votingOptions[3]) {
                reactionEmojis.push(options[3].emoji);
            }
            if (votingOptions[4]) {
                reactionEmojis.push(options[4].emoji);
            }
            if (votingOptions[5]) {
                reactionEmojis.push(options[5].emoji);
            }

            //Send the initial poll message
            let pollMessage = await interactionCollector.channel.send({
                content: `${roleID != null ? "<@&" + roleID.value + ">" : ""}`, embeds: [pollEmbed],
            });

            //Create the initial poll bars (will be 0s)
            const pollMessageString = await generatePollBars(pollMessage, votingOptions);

            pollEmbed.setDescription(pollMessageString);
            await pollMessage.edit({embeds: [pollEmbed]});

            //React all the reactions
            for (const reaction of reactionEmojis) {
                await pollMessage.react(reaction);
            }

            //Add to database
            await pollSchema.create({
                pollId: generatedPollId,
                messageId: pollMessage.id,
                ownerId: interactionCollector.user.id,
                endUnix: Math.floor(pollEndTime.getTime() / 1000),
                channelId: interactionCollector.channel.id,
                votingOptions: votingOptions,
                title: title,
                ending: ending,
                active: true,
            });

            //Reaction listener for reaction adds
            interactionCollector.client.on("messageReactionAdd", async (reaction, user) => {
                //Check that the reaction is not a partial
                if (reaction.message.partial) await reaction.message.fetch();
                if (reaction.partial) await reaction.fetch();

                // Get database value for this poll
                const currentPoll = await pollSchema.findOne({
                    pollId: generatedPollId,
                });

                /*Check if:
                the reactor is not a bot,
                if the reaction is in a DM,
                if the message reacted to is the poll for this interaction,
                if the poll has ended and return if any are true */
                if (user.bot || !reaction.message.guild || pollMessage.id !== reaction.message.id || !currentPoll.active) return;

                //No new reactions emojis can be added
                const formattedEmoji = "<:" + reaction.emoji.name + ":" + reaction.emoji.id + ">";
                if (!reactionEmojis.includes(formattedEmoji)) {
                    reaction.users.remove(user.id).catch(console.error);
                }

                const listOfReactions = pollMessage.reactions.cache.values();

                //No new reactions emojis can be added
                for (const iteratedReaction of listOfReactions) {
                    // If the reaction is the one the user just added, skip it
                    if (iteratedReaction.emoji.name === reaction.emoji.name) continue;

                    // If the reaction was added by the user, remove it
                    if (iteratedReaction.users.cache.has(user.id)) {
                        await iteratedReaction.users.remove(user.id);
                    }
                }

                //Limit reactions to member if need be
                if (roleID != null) {
                    const member = await interaction.guild.members.fetch(user.id);
                    if (!member.roles.cache.has(roleID.value)) {
                        reaction.users.remove(user.id).catch(console.error);
                        return;
                    }
                }

                const pollMessageString = await generatePollBars(pollMessage, votingOptions);
                pollEmbed.setDescription(pollMessageString);
                await pollMessage.edit({embeds: [pollEmbed]});
            });

            interactionCollector.client.on("messageReactionRemove", async (reaction, user) => {
                if (reaction.message.partial) await reaction.message.fetch();
                if (reaction.partial) await reaction.fetch();

                const currentPoll = await pollSchema.findOne({
                    pollId: generatedPollId,
                });

                if (user.bot || !reaction.message.guild || pollMessage.id !== reaction.message.id || !currentPoll.active) return;

                const pollMessageString = await generatePollBars(pollMessage, votingOptions);
                pollEmbed.setDescription(pollMessageString);
                await pollMessage.edit({embeds: [pollEmbed]});
            });
        });
    },
};

/**
 * Creates a new poll ID
 * @returns {Promise<string>} The generated poll ID
 * */
async function generatePollId() {
    const list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let generatedPollId = "";

    for (let i = 0; i < 10; i++) {
        const index = Math.floor(Math.random() * list.length);
        generatedPollId += list.charAt(index);
    }

    const data = await pollSchema.findOne({pollId: generatedPollId});

    return data ? generatePollId() : generatedPollId;
}
