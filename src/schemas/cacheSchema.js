const {model, Schema} = require("mongoose");

let cacheSchema = new Schema({
    uuid: String,
    data: String,
    expiry: Date,
});

module.exports = model("cacheSchema", cacheSchema);