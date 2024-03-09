const { getBar } = require("../globalFunctions/getBar");
const gameSchema = require("../schemas/gameSchema");

/**
 * Generates the poll bars for the poll message
 * @param {Message} pollMessage The poll message
 * @param {boolean[]} votingOptions The voting options
 * @returns {string} The poll message string
 * */
async function generatePollBars(pollMessage, votingOptions) {
  // Get the games from the database
  const games = await gameSchema.find();
  let options = games.map((game) => {
    return {
      label: game.name,
      value: game.value,
      emoji: game.emoji,
    };
  });

  //Filter out games that have have any fields undefined
  options = options.filter(
    (option) =>
      option.label != undefined &&
      option.value != undefined &&
      option.emoji != undefined
  );

  // Get the reactions for the poll message
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
    if (reactionCode === options[0].emoji.split(":")[1]) {
      battleBoxVotes = reaction.count - 1;
    } else if (reactionCode === options[1].emoji.split(":")[1] ) {
      dynaballVotes = reaction.count - 1;
    } else if (reactionCode === options[2].emoji.split(":")[1]) {
      holeInWallVotes = reaction.count - 1;
    } else if (reactionCode === options[3].emoji.split(":")[1]) {
      parkourWarriorVotes = reaction.count - 1;
    } else if (reactionCode === options[4].emoji.split(":")[1]) {
      skyBattleVotes = reaction.count - 1;
    } else if (reactionCode === options[5].emoji.split(":")[1]) {
      toGetToOtherSideVotes = reaction.count - 1;
    }
    totalReactions += reaction.count - 1;
  });

  // Calculate the percentage of votes for each vote option
  let battleBoxPercentage = 0;
  let dynaballPercentage = 0;
  let holeInWallPercentage = 0;
  let parkourWarriorPercentage = 0;
  let skyBattlePercentage = 0;
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
    parkourWarriorPercentage =
      Math.round(
        ((parkourWarriorVotes * 100) / totalReactions + Number.EPSILON) * 100
      ) / 100;
    dynaballPercentage =
      Math.round(
        ((dynaballVotes * 100) / totalReactions + Number.EPSILON) * 100
      ) / 100;
  }
  // Update the poll message with the new vote counts and percentages
  let pollMessageString = " ";
  if (votingOptions[0]) {
    pollMessageString += `**Battle Box**  ${options[0].emoji} ${getBar(
      battleBoxPercentage
    )} [ ${battleBoxPercentage}% • ${battleBoxVotes} ]\n\n`;
  }
  if (votingOptions[1]) {
    pollMessageString += `**Dynaball** ${options[1].emoji} ${getBar(
      dynaballPercentage
    )} [ ${dynaballPercentage}% • ${dynaballVotes} ]\n\n`;
  }
  if (votingOptions[2]) {
    pollMessageString += `**Hole In Wall**  ${options[2].emoji} ${getBar(
      holeInWallPercentage
    )} [ ${holeInWallPercentage}% • ${holeInWallVotes} ]\n\n`;
  }
  if (votingOptions[3]) {
    pollMessageString += `**Parkour Warrior: Survivor**  ${
      options[3].emoji
    } ${getBar(
      parkourWarriorPercentage
    )} [ ${parkourWarriorPercentage}% • ${parkourWarriorVotes} ]\n\n`;
  }
  if (votingOptions[4]) {
    pollMessageString += `**Sky Battle**  ${options[4].emoji} ${getBar(
      skyBattlePercentage
    )} [ ${skyBattlePercentage}% • ${skyBattleVotes} ]\n\n`;
  }
  if (votingOptions[5]) {
    pollMessageString += `**To Get To The Other Side**  ${
      options[5].emoji
    } ${getBar(
      toGetToOtherSidePercentage
    )} [ ${toGetToOtherSidePercentage}% • ${toGetToOtherSideVotes} ]\n\n`;
  }
  pollMessageString += `Total Votes: ${totalReactions}`;
  return pollMessageString;
}

module.exports = { generatePollBars };
