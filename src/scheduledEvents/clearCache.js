const cacheSchema = require("../schemas/cacheSchema");

/**
 * This scheduled event will run every minute and delete any expired caches
 * @type {{data: {interval: string}, execute: (function(): Promise<void>)}}
 * @typedef {Object} caches
 * @property {number} length
 * @property {function} forEach
 **/
module.exports = {
    data: {
        // change to run at 1:30am every day
        interval: "*/1 * * * *",
    }, async execute() {
        const caches = await checkExpiredCaches();
        caches.forEach((poll) => poll.deleteOne());
        if (caches.length > 0) console.log("Deleted " + caches.length + " cache(s)");
    },
};

/**
 * Checks for any expired caches
 * @returns {Promise<caches>}
 **/
async function checkExpiredCaches() {
    const currentTime = Math.floor(Date.now() / 1000);
    return cacheSchema.find({
        expiry: {$lt: currentTime}
    });
}