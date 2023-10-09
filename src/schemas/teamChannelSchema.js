const { model, Schema } = require("mongoose");

let teamChannelSchema = new Schema({
  guildId: String,
  teams: {
    type: [[String, String, Schema.Types.Mixed]],
    validate: {
      validator: function (arr) {
        return arr.every((subArr) => {
          return subArr.every((val) => {
            return val === null || typeof val === "string";
          });
        });
      },
      message: "Teams array must contain only strings or null values",
    },
  },
});

module.exports = model("teamChannelSchema", teamChannelSchema);
