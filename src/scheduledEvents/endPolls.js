const { EmbedBuilder, Attachment } = require("discord.js");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const Discord = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const gameSchema = require("../schemas/gameSchema");
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
      let battleBoxVotes = 0;
      let dynaballVotes = 0;
      let holeInWallVotes = 0;
      let parkourWarriorVotes = 0;
      let skyBattleVotes = 0;
      let toGetToOtherSideVotes = 0;
      let totalReactions = 0;

      // Count the number of reactions for each vote option
      reactions.forEach((reaction) => {
        const reactionCode = reaction.emoji.name;
        if (reactionCode === "gameBB") {
          battleBoxVotes = reaction.count - 1;
        } else if (reactionCode === "gameDyB") {
          dynaballVotes = reaction.count - 1;
        } else if (reactionCode === "gameHITW") {
          holeInWallVotes = reaction.count - 1;
        } else if (reactionCode === "gamePKWS") {
          parkourWarriorVotes = reaction.count - 1;
        } else if (reactionCode === "gameSB") {
          skyBattleVotes = reaction.count - 1;
        } else if (reactionCode === "gameTGTTOS") {
          toGetToOtherSideVotes = reaction.count - 1;
        }
        totalReactions += reaction.count - 1;
      });

      let winnerEmbed = new EmbedBuilder()
        .setColor(guildIconColour)
        .setTitle(
          `<:mcc_crown:1112828436839407756>** Winner of the vote '${poll.title}' is:**`
        );
      let winner;

      //Get game json from database and add fields for votes and weight
      let games = await gameSchema.find({});

      games.forEach((game) => {
        switch (game.name) {
          case "Battle Box":
            game.votes = battleBoxVotes;
            game.weight = battleBoxVotes / totalReactions;
            break;
          case "Dynaball":
            game.votes = dynaballVotes;
            game.weight = dynaballVotes / totalReactions;
            break;
          case "Hole in the Wall":
            game.votes = holeInWallVotes;
            game.weight = holeInWallVotes / totalReactions;
            break;
          case "Parkour Warrior: Survivor":
            game.votes = parkourWarriorVotes;
            game.weight = parkourWarriorVotes / totalReactions;
            break;
          case "Sky Battle":
            game.votes = skyBattleVotes;
            game.weight = skyBattleVotes / totalReactions;
            break;
          case "To Get to the Other Side":
            game.votes = toGetToOtherSideVotes;
            game.weight = toGetToOtherSideVotes / totalReactions;
            break;
        }
      });


      let gamesCopy = JSON.parse(JSON.stringify(games));

      games.sort((a, b) => b.votes - a.votes);

      if (games[0].votes > games[1].votes) {
        winner = "# " + games[0].name;
        winnerEmbed.setThumbnail(games[0].thumbnail);
      } else {
        winner = "More than one game.";
      }

      switch (ending) {
        case "normal":
          winnerEmbed.setDescription(
            `# **  ${winner}  **\n<:star:1094418485951615027>** Total votes cast:**  ${totalReactions}`
          );
          await pollMessageChannel.send({ embeds: [winnerEmbed] });
          break;
        case "noEnding":
          gamesCopy.forEach((game) => {
            switch (game.name) {
              case "Battle Box":
                game.votes = battleBoxVotes;
                game.weight = battleBoxVotes / totalReactions;
                break;
              case "Dynaball":
                game.votes = dynaballVotes;
                game.weight = dynaballVotes / totalReactions;
                break;
              case "Hole in the Wall":
                game.votes = holeInWallVotes;
                game.weight = holeInWallVotes / totalReactions;
                break;
              case "Parkour Warrior: Survivor":
                game.votes = parkourWarriorVotes;
                game.weight = parkourWarriorVotes / totalReactions;
                break;
              case "Sky Battle":
                game.votes = skyBattleVotes;
                game.weight = skyBattleVotes / totalReactions;
                break;
              case "To Get to the Other Side":
                game.votes = toGetToOtherSideVotes;
                game.weight = toGetToOtherSideVotes / totalReactions;
                break;
            }
          });
          const endEmbed = new EmbedBuilder()
            .setColor(guildIconColour)
            .setTitle(`Vote '${poll.title}' has ended!`);
          let description =
            "## The vote has ended with the following results:\n";
          for (let i = 0; i < gamesCopy.length; i++) {
            if (votingOptions[i]) {
              description += `\n### ${gamesCopy[i].emoji} ${gamesCopy[i].name} - ${gamesCopy[i].votes} votes\n`;
            }
          }
          description += "\nTotal votes cast: " + totalReactions;
          endEmbed.setDescription(description);
          await pollMessageChannel.send({ embeds: [endEmbed] });
          break;
        case "weighted":
          weightedWheel(
            gamesCopy,
            pollMessageChannel,
            winnerEmbed,
            guildIconColour
          );

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
  const currentTime = Math.floor(Date.now() / 1000);
  try {
    return await pollSchema.find({
      active: true,
      endUnix: { $lt: currentTime },
    });
  } catch (error) {
    const formattedDateTime = formatDateTime(new Date());
    console.error(
      `Error retrieving the active polls at time: ${formattedDateTime}. Error message: ${error}`
    );
  }
}

async function weightedWheel(
  gamesCopy,
  pollMessageChannel,
  winnerEmbed,
  guildIconColour
) {
  let winMessage;
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
  await winMessage.edit({ embeds: [winnerEmbed] });
}
