const { EmbedBuilder } = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const { generatePollBars } = require("../globalFunctions/generatePollBars");
const { getMostFrequentGuildIconColour } = require("../globalFunctions/getMostFrequentGuildIconColour");

module.exports = {
  data: {
    interval: "*/15 * * * * *",
  },
  async execute(client) {
    const polls = await checkEndedPolls();
    for (const poll of polls) {
      try {
        const { messageId, votingOptions, channelId } = poll;
        const pollMessageChannel = await client.channels.fetch(channelId);
        const pollMessage = await pollMessageChannel.messages.fetch(messageId);
        const guildIconColour = await getMostFrequentGuildIconColour(pollMessageChannel.guild.id);
        const pollEmbed = pollMessage.embeds[0];

        const pollMessageString = await generatePollBars(pollMessage, votingOptions);
        pollEmbed.setDescription(pollMessageString);
        await pollMessage.edit({ embeds: [pollEmbed] });

        const reactions = await pollMessage.reactions.cache;
        const voteCounts = new Map();
        let totalReactions = 0;

        reactions.forEach((reaction) => {
          const reactionCode = reaction.emoji.name;
          if (votingOptions.includes(reactionCode)) {
            const voteCount = reaction.count - 1;
            voteCounts.set(reactionCode, voteCount);
            totalReactions += voteCount;
          }
        });

        const games = [
          {
            name: "# Sky Battle",
            code: "game_sb",
            thumbnail: "https://cdn.discordapp.com/emojis/1089592353645412482.webp?size=1024&quality=lossless",
          },
          {
            name: "# Battle Box",
            code: "game_bb",
            thumbnail: "https://cdn.discordapp.com/emojis/1089592675595984986.webp?size=1024&quality=lossless",
          },
          {
            name: "# Hole In The Wall",
            code: "game_hitw",
            thumbnail: "https://cdn.discordapp.com/emojis/1089592541663469678.webp?size=1024&quality=lossless",
          },
          {
            name: "# To Get To The Other Side",
            code: "game_tgttos",
            thumbnail: "https://cdn.discordapp.com/emojis/1089592804696653906.webp?size=1024&quality=lossless",
          },
        ];

        const winner = games.reduce((prev, curr) => (voteCounts.get(curr.code) > voteCounts.get(prev.code) ? curr : prev));

        let winnerEmbed = new EmbedBuilder()
          .setColor(guildIconColour)
          .setTitle("<:mcc_crown:1112828436839407756>** Winner of the vote is:**");

        if (winner) {
          winnerEmbed.setDescription(
            `# ** ${winner.name} **\n<:star:1094418485951615027>** Total votes cast:**  ${totalReactions}`
          );
          winnerEmbed.setThumbnail(winner.thumbnail);
        } else {
          winnerEmbed.setDescription("More than one game.");
        }

        await pollMessageChannel.send({ embeds: [winnerEmbed] });
      } catch (error) {
        console.error("Error processing poll:", error);
      }
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
    console.log(activePolls);
    return activePolls;
  } catch (error) {
    const currentTime = new Date();
    const formattedDateTime = formatDateTime(currentTime);
    console.error(
      `Error retrieving the active polls at time: ${formattedDateTime}. Error message: ${error}`
    );
  }
}

function formatDateTime(date) {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const timeString = date.toLocaleTimeString([], options).replace(/:\d+ /, " ");
  const dateString = date.toLocaleDateString([], options).replace(/\//g, "/");
  return `${timeString} ${dateString}`;
}
