const {model, Schema} = require("mongoose");

let gameSchema = new Schema({
    name: String, colour: String, emoji: String, thumbnail: String, value: String,
});

module.exports = model("gameSchema", gameSchema);
