const { getBar } = require("../globalFunctions/getBar");

/**
 * Generates the poll bars for the poll message
 * @param {Message} pollMessage The poll message
 * @param {boolean[]} votingOptions The voting options
 * @returns {string} The poll message string
 * */
async function generatePollBars(pollMessage, votingOptions) {
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
    pollMessageString += `**Battle Box**  <:gameBB:1179531958183796747> ${getBar(
      battleBoxPercentage
    )} [ ${battleBoxPercentage}% • ${battleBoxVotes} ]\n\n`;
  }
  if (votingOptions[1]) {
    pollMessageString += `**Dynaball**  <:gameDyB:1179532946420531270> ${getBar(
      dynaballPercentage
    )} [ ${dynaballPercentage}% • ${dynaballVotes} ]\n\n`;
  }
  if (votingOptions[2]) {
    pollMessageString += `**Hole In Wall**  <:gameHITW:1179531960415158292> ${getBar(
      holeInWallPercentage
    )} [ ${holeInWallPercentage}% • ${holeInWallVotes} ]\n\n`;
  }
  if (votingOptions[3]) {
    pollMessageString += `**Parkour Warrior: Survivor**  <:gamePKW:1179531961686052884> ${getBar(
      parkourWarriorPercentage
    )} [ ${parkourWarriorPercentage}% • ${parkourWarriorVotes} ]\n\n`;
  }
  if (votingOptions[4]) {
    pollMessageString += `**Sky Battle**  <:gameSB:1179531963925798952> ${getBar(
      skyBattlePercentage
    )} [ ${skyBattlePercentage}% • ${skyBattleVotes} ]\n\n`;
  }
  if (votingOptions[5]) {
    pollMessageString += `**To Get To The Other Side**  <:gameTGTTOS:1179531966203314176> ${getBar(
      toGetToOtherSidePercentage
    )} [ ${toGetToOtherSidePercentage}% • ${toGetToOtherSideVotes} ]\n\n`;
  }
  pollMessageString += `Total Votes: ${totalReactions}`;
  return pollMessageString;
}

module.exports = { generatePollBars };
