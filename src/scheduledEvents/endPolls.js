const { EmbedBuilder, Attachment } = require("discord.js");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const Discord = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const { generatePollBars } = require("../globalFunctions/generatePollBars");
const {
  getMostFrequentGuildIconColour,
} = require("../globalFunctions/getMostFrequentGuildIconColour");
const { formatDateTime } = require("../globalFunctions/formatDateTime");
const { generateSpinWheel } = require("../globalFunctions/spin-wheel");

module.exports = {
  data: {
    interval: "*/5 * * * * *",
  },
  async execute(client) {
    const polls = await checkEndedPolls();
    for (const poll of polls) {
      poll.active = false;
      await poll.save();
      const messageId = poll.messageId;
      const votingOptions = poll.votingOptions;
      const pollMessageChannel = await client.channels.fetch(poll.channelId);
      const pollMessage = await pollMessageChannel.messages.fetch(messageId);

      const ending = poll.ending;

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
      let parkourWarriorVotes = 0;

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
        } else if (reactionCode === "gamePKWS") {
          parkourWarriorVotes = reaction.count - 1;
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
          weight: skyBattleVotes / totalReactions,
          emoji: "<:gameSB:1128115696832893018>",
          colour: "#ee2700",
          thumbnail:
            "https://cdn.discordapp.com/emojis/1128115696832893018.webp?size=1024&quality=lossless",
        },
        {
          name: "Battle Box",
          votes: battleBoxVotes,
          weight: battleBoxVotes / totalReactions,
          colour: "#08b932",
          emoji: "<:gameBB:1089592675595984986>",
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592675595984986.webp?size=1024&quality=lossless",
        },
        {
          name: "Hole In The Wall",
          votes: holeInWallVotes,
          weight: holeInWallVotes / totalReactions,
          colour: "#5aff77",
          emoji: "<:gameHITW:1089592541663469678>",
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592541663469678.webp?size=1024&quality=lossless",
        },
        {
          name: "To Get To The Other Side",
          votes: toGetToOtherSideVotes,
          weight: toGetToOtherSideVotes / totalReactions,
          colour: "#ffffff",
          emoji: "<:gameTGTTOS:1089592804696653906>",
          thumbnail:
            "https://cdn.discordapp.com/emojis/1089592804696653906.webp?size=1024&quality=lossless",
        },
        {
          name: "Parkour Warrior: Survivor",
          votes: parkourWarriorVotes,
          weight: parkourWarriorVotes / totalReactions,
          colour: "#11623F",
          emoji: "<:gamePKWS:1128101611307278366>",
          thumbnail:
            "https://cdn.discordapp.com/emojis/1128101611307278366.webp?size=1024&quality=lossless",
        },
      ];

      const gamesCopy = JSON.parse(JSON.stringify(games));

      games.sort((a, b) => b.votes - a.votes);

      if (games[0].votes > games[1].votes) {
        winner = "# " + games[0].name;
        winnerEmbed.setThumbnail(games[0].thumbnail);
      } else {
        winner = "More than one game.";
      }

      let winMessage;

      switch (ending) {
        case "normal":
          winnerEmbed.setDescription(
            `# **  ${winner}  **\n<:star:1094418485951615027>** Total votes cast:**  ${totalReactions}`
          );
          await pollMessageChannel.send({ embeds: [winnerEmbed] });
          break;
        case "noEnding":
          const endEmbed = new EmbedBuilder()
            .setColor(guildIconColour)
            .setTitle(`Vote '${poll.title}' has ended!`);
          let description =
            "## The vote has ended with the following results:\n";
          for (let i = 0; i < games.length; i++) {
            if (votingOptions[i]) {
              description += `\n### ${games[i].emoji} ${games[i].name} - ${games[i].votes} votes\n`;
            }
          }
          description += "\nTotal votes cast: " + totalReactions;
          endEmbed.setDescription(description);
          await pollMessageChannel.send({ embeds: [endEmbed] });
          break;
        case "weighted":
          weightedWheel(gamesCopy, pollMessageChannel, winnerEmbed);
          await winMessage.edit({ embeds: [winnerEmbed] });
          break;
        case "random":
          break;
        default:
          break;
      }
    }
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function weightedWheel(gamesCopy, pollMessageChannel, winnerEmbed) {
  const FRAME_DELAY_MS = 50;
  const MAX_DURATION_MS = 5000;
  const LAST_FRAME_DURATION_MS = 1000 / FRAME_DELAY_MS;
  const MIN_ANGLE = 360;
  const MAX_ANGLE = 360 * 8;
  const DURATION = MAX_DURATION_MS / FRAME_DELAY_MS;

  const styles = {
    canvas: {
      width: 250,
      height: 250,
    },
  };

  const randomEndAngle = Math.random() * (MAX_ANGLE - MIN_ANGLE) + MIN_ANGLE;

  const wheel = generateSpinWheel(
    gamesCopy,
    randomEndAngle,
    DURATION,
    FRAME_DELAY_MS,
    styles.canvas.width,
    styles.canvas.height,
    LAST_FRAME_DURATION_MS
  );

  winner = wheel.selectedOption;
  console.log(winner);
  gamesCopy.filter((option) => option.name === winner);
  winnerEmbed.setThumbnail(gamesCopy[0].thumbnail);

  const spinWheelAttachment = new Discord.AttachmentBuilder(wheel.getGif(), {
    name: "spin-wheel.gif",
  });

  const spinningEmbed = new EmbedBuilder()
    .setTitle("Weighted Wheel Results...")
    .setColor(guildIconColour);

  winMessage = await pollMessageChannel.send({
    embeds: [spinningEmbed],
    files: [spinWheelAttachment],
  });
  for (let i = 0; i < 8; i++) {
    spinningEmbed.setDescription(`##  Spinning${".".repeat(i % 4)}`);
    await winMessage.edit({ embeds: [spinningEmbed] });
    await sleep(500);
  }
}
