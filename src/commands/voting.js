const {
  SlashCommandBuilder,
  EmbedBuilder,
  Collection,
  PermissionFlagsBits,
} = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const { generatePollBars } = require("../globalFunctions/generatePollBars");
const {
  getMostFrequentGuildIconColour,
} = require("../globalFunctions/getMostFrequentGuildIconColour");

module.exports = {
  cooldown: 30,
  //Create the vote command
  data: new SlashCommandBuilder()
    .setName(`begin_vote`)
    .setDescription(`Begins the voting for which game you wish to play next!`)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName(`title`)
        .setDescription(`The title of the voting poll`)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName(`duration`)
        .setDescription(`The duration of the poll, in minutes`)
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName(`sb_votable`)
        .setDescription(`Determines whether Sky Battle is in the vote`)
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName(`bb_votable`)
        .setDescription(`Determines whether Battle Box is in the vote`)
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName(`hitw_votable`)
        .setDescription(`Determines whether Hole in the Wall is in the vote`)
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName(`tgttos_votable`)
        .setDescription(
          `Determines whether To Get to the Other Side is in the vote`
        )
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName(`pkws_votable`)
        .setDescription(
          `Determines whether Parkour Warrior: Survivor is in the vote`
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName(`ending`)
        .setDescription(`Determines the ending of the vote.`)
        .addChoices(
          {
            name: "Normal",
            value: "normal",
          },
          {
            name: "No ending",
            value: "noEnding",
          },
          {
            name: "Weighted (not functional currently)",
            value: "weighted",
          },
          {
            name: "Random - troll kekw",
            value: "random",
          }
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addRoleOption((option) =>
      option
        .setName(`role`)
        .setDescription(`Option role that restricts who can vote`)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply("Sending reply now!");

    //Define main variables from options of command
    const title = interaction.options.get("title").value;
    const duration = interaction.options.get("duration").value;
    const votingOptions = [
      interaction.options.get("sb_votable").value,
      interaction.options.get("bb_votable").value,
      interaction.options.get("hitw_votable").value,
      interaction.options.get("tgttos_votable").value,
      interaction.options.get("pkws_votable").value,
    ];

    const ending = interaction.options.get("ending").value;

    const roleID = interaction.options.get("role") ?? null;

    //Get the average colour of the guild PFP for the embeds' colour
    const guild = interaction.guild;
    const guildIconColour = await getMostFrequentGuildIconColour(guild);

    //Get the Unix-Discord syntax for when the poll ends
    const pollEndTime = new Date();
    pollEndTime.setMinutes(pollEndTime.getMinutes() + duration);
    const pollEndTimeString = `<t:${Math.floor(
      pollEndTime.getTime() / 1000
    )}:R>`;
    const generatedPollId = await generatePollId();
    if (generatedPollId == "Error generating poll ID.") {
      await interaction.reply(generatedPollId);
    }

    //Create poll embed
    let pollEmbed = new EmbedBuilder()
      .setColor(guildIconColour)
      .setTitle(title)
      .addFields({
        name: `Details`,
        value: `Poll ends ${[pollEndTimeString]}`,
        inline: false,
      })
      .setFooter({
        text: `Poll ID: ${generatedPollId} | Created by: ${interaction.user.username}`,
        iconURl: interaction.user.iconURL,
      });

    //Create list of all the relevant reaction emojis for this vote
    let reactionEmojis = [];
    if (votingOptions[0]) {
      reactionEmojis.push("<:gameSB:1128115696832893018>");
    }
    if (votingOptions[1]) {
      reactionEmojis.push("<:gameBB:1089592675595984986>");
    }
    if (votingOptions[2]) {
      reactionEmojis.push("<:gameHITW:1089592541663469678>");
    }
    if (votingOptions[3]) {
      reactionEmojis.push("<:gameTGTTOS:1089592804696653906>");
    }
    if (votingOptions[4]) {
      reactionEmojis.push("<:gamePKWS:1128101611307278366>");
    }

    //Sends the initial embed
    let pollMessage = await interaction.channel.send({ embeds: [pollEmbed] });

    //Create the initial poll bars (will be 0s)
    const pollMessageString = await generatePollBars(
      pollMessage,
      votingOptions
    );

    pollEmbed.setDescription(pollMessageString);
    await pollMessage.edit({ embeds: [pollEmbed] });

    //React all the reactions
    for (const reaction of reactionEmojis) {
      pollMessage.react(reaction);
    }

    //Add to database
    pollSchema.create({
      pollId: generatedPollId,
      messageId: pollMessage.id,
      ownerId: interaction.user.id,
      endUnix: Math.floor(pollEndTime.getTime() / 1000),
      channelId: interaction.channel.id,
      votingOptions: votingOptions,
      title: title,
      ending: ending,
      active: true,
    });

    //Reaction listener for reaction adds
    interaction.client.on("messageReactionAdd", async (reaction, user) => {
      //Check that the reaction is not a partial
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();

      // Get database value for this poll
      const currentPoll = await pollSchema.findOne({ pollId: generatedPollId });

      /*Check if:
      the reactor is not a bot,
      if the reaction is in a DM,
      if the message reacted to is the poll for this interaction,
      if the poll has ended and return if any are true */
      if (
        user.bot ||
        !reaction.message.guild ||
        pollMessage.id != reaction.message.id ||
        !currentPoll.active
      )
        return;

      //No new reactions emojis can be added
      if (!reactionEmojis.includes(reaction._emoji.toString())) {
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

      const pollMessageString = await generatePollBars(
        pollMessage,
        votingOptions
      );
      pollEmbed.setDescription(pollMessageString);
      await pollMessage.edit({ embeds: [pollEmbed] });
    });

    interaction.client.on("messageReactionRemove", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();

      const currentPoll = await pollSchema.findOne({ pollId: generatedPollId });

      if (
        user.bot ||
        !reaction.message.guild ||
        pollMessage.id != reaction.message.id ||
        !currentPoll.active
      )
        return;

      const pollMessageString = await generatePollBars(
        pollMessage,
        votingOptions
      );
      pollEmbed.setDescription(pollMessageString);
      await pollMessage.edit({ embeds: [pollEmbed] });
    });
  },
};

async function generatePollId() {
  const length = 10;
  const list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let generatedPollId = "";
  const random = Math.random;

  for (let i = 0; i < length; i++) {
    const index = Math.floor(random() * list.length);
    const randomChar = list.charAt(index);
    generatedPollId += randomChar;
  }

  const data = await pollSchema.findOne({ pollId: generatedPollId });

  if (!data) {
    return generatedPollId;
  } else {
    try {
      return generatePollId();
    } catch (error) {
      return "Error generating poll ID.";
    }
  }
}
