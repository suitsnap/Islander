const {cacheSchema} = require("../schemas/cacheSchema");

module.exports = {
    data: {
        interval: "*/1 * * * *",
    }, async execute(client) {
        const now = Math.floor(Date.now() / 1000);
        await cacheSchema.deleteMany({expiry: {$lte: now}});
    }
}