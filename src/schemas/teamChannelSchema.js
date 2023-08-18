const { model, Schema } = require("mongoose");

let teamChannelSchema = new Schema({
  guildId: String,
  teams: [[String], [String], [String]],
});

module.exports = model("teamChannelSchema", teamChannelSchema);
