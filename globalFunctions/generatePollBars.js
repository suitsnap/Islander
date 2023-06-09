const { getBar } = require("../globalFunctions/getBar");

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

module.exports = { generatePollBars };
