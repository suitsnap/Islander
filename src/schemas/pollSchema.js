const {model, Schema} = require("mongoose");

let pollSchema = new Schema({
    pollId: String,
    messageId: String,
    ownerId: String,
    endUnix: String,
    channelId: String,
    votingOptions: [Boolean],
    ending: String,
    title: String,
    active: Boolean,
});

module.exports = model("pollSchema", pollSchema);
