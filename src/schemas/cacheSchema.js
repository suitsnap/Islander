const {model, Schema} = require("mongoose");

let cacheSchema = new Schema({
    uuid: String, data: Object, expiry: Number, type: String,
});

module.exports = model("cacheSchema", cacheSchema);