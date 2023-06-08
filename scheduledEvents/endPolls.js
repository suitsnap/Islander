const { EmbedBuilder } = require("discord.js");
const pollSchema = require("../schemas/pollSchema");
const mongoose = require("mongoose");

module.exports = {
  data: {
    interval: "15 * * * * *",
  },
  async execute(client) {
    const polls = await checkEndedPolls();
    for (const poll of polls) {
      const messageId = poll.messageId;
      const pollMessageChannel = await client.channels.fetch(poll.channelId);
      const pollMessage = await pollMessageChannel.messages.fetch(messageId);
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
