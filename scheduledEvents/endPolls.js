const { EmbedBuilder, Attachment } = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const { generatePollBars } = require("../globalFunctions/generatePollBars");
const {
  getMostFrequentGuildIconColour,
} = require("../globalFunctions/getMostFrequentGuildIconColour");
const { formatDateTime } = require("../globalFunctions/formatDateTime");
const fetch = require("isomorphic-fetch");
const { wheelToken } = require("../config.json");

module.exports = {
  data: {
    interval: "*/15 * * * * *",
  },
  async execute(client) {
    const polls = await checkEndedPolls();
    for (const poll of polls) {
      const messageId = poll.messageId;
      const votingOptions = poll.votingOptions;
      const pollMessageChannel = await client.channels.fetch(poll.channelId);
      const pollMessage = await pollMessageChannel.messages.fetch(messageId);

      const weighted = poll.weighted;

      const guildIconColour = await getMostFrequentGuildIconColour(
        pollMessageChannel.guild
      );
      const pollEmbed = EmbedBuilder.from(pollMessage.embeds[0]);

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
        if (reactionCode === "gameSB") {
          skyBattleVotes = reaction.count - 1;
        } else if (reactionCode === "gameBB") {
          battleBoxVotes = reaction.count - 1;
        } else if (reactionCode === "gameHITW") {
          holeInWallVotes = reaction.count - 1;
        } else if (reactionCode === "gameTGTTOS") {
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
          name: "Sky Battle",
          votes: skyBattleVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592353645412482.webp?size=1024&quality=lossless",
        },
        {
          name: "Battle Box",
          votes: battleBoxVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592675595984986.webp?size=1024&quality=lossless",
        },
        {
          name: "Hole In The Wall",
          votes: holeInWallVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592541663469678.webp?size=1024&quality=lossless",
        },
        {
          name: "To Get To The Other Side",
          votes: toGetToOtherSideVotes,
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592804696653906.webp?size=1024&quality=lossless",
        },
      ];

      const gamesListForWheel = games
        .filter((game) => game.votes > 0)
        .map((game) => ({ text: game.name, weight: game.votes }));

      games.sort((a, b) => b.votes - a.votes);

      if (games[0].votes > games[1].votes) {
        winner = "# " + games[0].name;
        winnerEmbed.setThumbnail(games[0].thumbnail);
      } else {
        winner = "More than one game.";
      }

      if (weighted) {
        winner = "Me! "
      }

      winnerEmbed.setDescription(
        `# **  ${winner}  **\n<:star:1094418485951615027>** Total votes cast:**  ${totalReactions}`
      );
      await pollMessageChannel.send({ embeds: [winnerEmbed] });
      poll.active = false;
      await poll.save();
    }
  },
};

async function checkEndedPolls() {
  try {
    const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
    const activePolls = await pollSchema.find({
      active: true,
      endUnix: { $lt: currentTime },
    });
    return activePolls;
  } catch (error) {
    const currentTime = new Date();
    const formattedDateTime = formatDateTime(currentTime);
    console.error(
      `Error retrieving the active polls at time: ${formattedDateTime}. Error message: ${error}`
    );
  }
}
