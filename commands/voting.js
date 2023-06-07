const {
  SlashCommandBuilder,
  EmbedBuilder,
  Collection,
  PermissionFlagsBits,
} = require("discord.js");
const axios = require("axios");
const Jimp = require("jimp");
const pollSchema = require("../schemas/pollSchema");
const mongoose = require("mongoose");

module.exports = {
  //Create the vote command
  data: new SlashCommandBuilder()
    .setName(`begin_vote`)
    .setDescription(`Begins the voting for which game you wish to play next!`)
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
    .addRoleOption((option) =>
      option
        .setName(`role`)
        .setDescription(`Option role that restricts who can vote`)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply("Sending reply now!");

    //Define main variables from options of command
    const title = interaction.options.get("title").value;
    const duration = interaction.options.get("duration").value;
    const durationInMillis = duration * 60000;
    const votingOptions = [
      interaction.options.get("sb_votable").value,
      interaction.options.get("bb_votable").value,
      interaction.options.get("hitw_votable").value,
      interaction.options.get("tgttos_votable").value,
    ];
    const roleID = interaction.options.get("role") ?? null;
    let timedOut = false;
    const reactionCount = new Collection();

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
      reactionEmojis.push("<:game_sb:1089592353645412482>");
    }
    if (votingOptions[1]) {
      reactionEmojis.push("<:game_bb:1089592675595984986>");
    }
    if (votingOptions[2]) {
      reactionEmojis.push("<:game_hitw:1089592541663469678>");
    }
    if (votingOptions[3]) {
      reactionEmojis.push("<:game_tgttos:1089592804696653906>");
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

    //Add to database in case of emergency (bot stops mid vote)
    pollSchema.create({
      pollId: generatedPollId,
      messageId: pollMessage.id,
      ownerId: interaction.user.id,
      endUnix: pollEndTimeString,
      active: true,
    });

    //Begin timer to execute once the timer is over
    let durationOfVote = setTimeout(async () => {
      const pollMessageString = await generatePollBars(
        pollMessage,
        votingOptions
      );
      pollEmbed.setDescription(pollMessageString);
      await pollMessage.edit({ embeds: [pollEmbed] });

      const reactions = await pollMessage.reactions.cache;
      let totalReactions = 0;
      let skyBattleVotes = 0;
      let battleBoxVotes = 0;
      let holeInWallVotes = 0;
      let toGetToOtherSideVotes = 0;

      // Count the number of reactions for each vote option
      reactions.forEach((reaction) => {
        const reactionCode = reaction.emoji.name;
        if (reactionCode === "game_sb") {
          skyBattleVotes = reaction.count - 1;
        } else if (reactionCode === "game_bb") {
          battleBoxVotes = reaction.count - 1;
        } else if (reactionCode === "game_hitw") {
          holeInWallVotes = reaction.count - 1;
        } else if (reactionCode === "game_tgttos") {
          toGetToOtherSideVotes = reaction.count - 1;
        }
        totalReactions += reaction.count - 1;
      });

      let winnerEmbed = new EmbedBuilder()
        .setColor(guildIconColour)
        .setTitle(
          "<:mcc_crown:1112828436839407756>** Winner of the vote is:**"
        );
      let winner;

      const games = [
        {
          name: "# Sky Battle",
          votes: skyBattleVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592353645412482.webp?size=1024&quality=lossless",
        },
        {
          name: "# Battle Box",
          votes: battleBoxVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592675595984986.webp?size=1024&quality=lossless",
        },
        {
          name: "# Hole In The Wall",
          votes: holeInWallVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592541663469678.webp?size=1024&quality=lossless",
        },
        {
          name: "# To Get To The Other Side",
          votes: toGetToOtherSideVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592804696653906.webp?size=1024&quality=lossless",
        },
      ];

      games.sort((a, b) => b.votes - a.votes);

      if (games[0].votes > games[1].votes) {
        winner = games[0].name;
        winnerEmbed.setThumbnail(games[0].thumbnail);
      } else {
        winner = "More than one game.";
      }

      winnerEmbed.setDescription(
        `# **  ${winner}  **\n<:star:1094418485951615027>** Total votes cast:**  ${totalReactions}`
      );
      await interaction.channel.send({ embeds: [winnerEmbed] });
      timedOut = true;
      clearTimeout(durationOfVote);
    }, durationInMillis);

    //Reaction listener for reaction adds
    interaction.client.on("messageReactionAdd", async (reaction, user) => {
      //Check that the reaction is not a partial
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();

      /*Check if:
      the reactor is not a bot,
      if the reaction is in a DM,
      if the message reacted to is the poll for this interaction,
      if the poll has ended and return if any are true */
      if (
        user.bot ||
        !reaction.message.guild ||
        pollMessage.id != reaction.message.id ||
        timedOut
      )
        return;

      //No new reactions emojis can be added
      if (!reactionEmojis.includes(reaction._emoji.toString())) {
        reaction.users.remove(user.id).catch(console.error);
      }

      const { message } = reaction;
      let member = reaction.message.guild.members.cache.get(user.id);

      //Limit reactions to member if need be
      if (roleID != null) {
        if (!member.roles.cache.has(roleID.value)) {
          reaction.users.remove(user.id).catch(console.error);
          return;
        }
      }

      if (!reactionCount.get(message))
        reactionCount.set(message, new Collection());
      const userCount = reactionCount.get(message);
      userCount.set(user, (userCount.get(user) || 0) + 1);

      if (userCount.get(user) > 1) {
        reaction.users.remove(user);
        return;
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
      if (
        user.bot ||
        !reaction.message.guild ||
        pollMessage.id != reaction.message.id ||
        timedOut
      )
        return;

      const { message } = reaction;
      const userCount = reactionCount.get(message);
      // subtract 1 from user's reaction count
      try {
        userCount.set(user, reactionCount.get(message).get(user) - 1);
      } catch (TypeError) {}
      const pollMessageString = await generatePollBars(
        pollMessage,
        votingOptions
      );
      pollEmbed.setDescription(pollMessageString);
      await pollMessage.edit({ embeds: [pollEmbed] });
    });
  },
};

async function getMostFrequentGuildIconColour(guild, stepSize = 1) {
  const iconURL = guild.iconURL({ extension: "png" });
  if (!iconURL) return null;

  const response = await axios.get(iconURL, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(response.data, "binary");

  const image = await Jimp.read(buffer);
  const pixelCounts = {};

  for (let y = 0; y < image.getHeight(); y += stepSize) {
    for (let x = 0; x < image.getWidth(); x += stepSize) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
      const colorHex = rgbToHex(r, g, b);

      if (!pixelCounts[colorHex]) {
        pixelCounts[colorHex] = 0;
      }

      pixelCounts[colorHex]++;
    }
  }

  const mostFrequentColor = Object.keys(pixelCounts).reduce((a, b) =>
    pixelCounts[a] > pixelCounts[b] ? a : b
  );

  return mostFrequentColor;
}

function rgbToHex(r, g, b) {
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

async function generatePollBars(pollMessage, votingOptions) {
  const reactions = await pollMessage.reactions.cache;
  let totalReactions = 0;
  let skyBattleVotes = 0;
  let battleBoxVotes = 0;
  let holeInWallVotes = 0;
  let toGetToOtherSideVotes = 0;

  // Count the number of reactions for each vote option
  reactions.forEach((reaction) => {
    const reactionCode = reaction.emoji.name;
    if (reactionCode === "game_sb") {
      skyBattleVotes = reaction.count - 1;
    } else if (reactionCode === "game_bb") {
      battleBoxVotes = reaction.count - 1;
    } else if (reactionCode === "game_hitw") {
      holeInWallVotes = reaction.count - 1;
    } else if (reactionCode === "game_tgttos") {
      toGetToOtherSideVotes = reaction.count - 1;
    }
    totalReactions += reaction.count - 1;
  });

  // Calculate the percentage of votes for each vote option
  let skyBattlePercentage = 0;
  let battleBoxPercentage = 0;
  let holeInWallPercentage = 0;
  let toGetToOtherSidePercentage = 0;

  if (totalReactions > 0) {
    skyBattlePercentage =
      Math.round(
        ((skyBattleVotes * 100) / totalReactions + Number.EPSILON) * 100
      ) / 100;
    battleBoxPercentage =
      Math.round(
        ((battleBoxVotes * 100) / totalReactions + Number.EPSILON) * 100
      ) / 100;
    holeInWallPercentage =
      Math.round(
        ((holeInWallVotes * 100) / totalReactions + Number.EPSILON) * 100
      ) / 100;
    toGetToOtherSidePercentage =
      Math.round(
        ((toGetToOtherSideVotes * 100) / totalReactions + Number.EPSILON) * 100
      ) / 100;
  }

  // Update the poll message with the new vote counts and percentages
  let pollMessageString = " ";
  if (votingOptions[0]) {
    pollMessageString += `**Sky Battle**  <:game_sb:1089592353645412482> ${getBar(
      skyBattlePercentage
    )} [ ${skyBattlePercentage}% • ${skyBattleVotes} ]\n\n`;
  }
  if (votingOptions[1]) {
    pollMessageString += `**Battle Box**  <:game_bb:1089592675595984986> ${getBar(
      battleBoxPercentage
    )} [ ${battleBoxPercentage}% • ${battleBoxVotes} ]\n\n`;
  }
  if (votingOptions[2]) {
    pollMessageString += `**Hole In Wall**  <:game_hitw:1089592541663469678> ${getBar(
      holeInWallPercentage
    )} [ ${holeInWallPercentage}% • ${holeInWallVotes} ]\n\n`;
  }
  if (votingOptions[3]) {
    pollMessageString += `**To Get To The Other Side**  <:game_tgttos:1089592804696653906> ${getBar(
      toGetToOtherSidePercentage
    )} [ ${toGetToOtherSidePercentage}% • ${toGetToOtherSideVotes} ]\n\n`;
  }
  pollMessageString += `Total Votes: ${totalReactions}`;
  return pollMessageString;
}

function getBar(percentage) {
  let bar = "[";
  if (percentage === 0) {
    bar += "░░░░░░░░░░";
  } else if (percentage % 10 === 0) {
    bar += "▓".repeat(percentage / 10);
    bar += "░".repeat(10 - percentage / 10);
  } else {
    bar += "▓".repeat(Math.floor(percentage / 10));
    bar += "▒";
    bar += "░".repeat(9 - Math.floor(percentage / 10));
  }
  bar += "]";
  return bar;
}

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
    return generatePollId();
  }
}
