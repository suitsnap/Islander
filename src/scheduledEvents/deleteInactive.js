const pollSchema = require("../schemas/pollSchema");

module.exports = {
    data: {
        // change to run at 1:30am every day
        interval: "30 1 * * *",
    },
    async execute() {
        const polls = await checkEndedPolls();
        polls.forEach((poll) => poll.deleteOne());
    },
};

async function checkEndedPolls() {
    const currentTime = Math.floor(Date.now() / 1000);
    const inactivePolls = await pollSchema.find({
        active: false,
        endUnix: { $lt: currentTime },
    });
    return inactivePolls;
}