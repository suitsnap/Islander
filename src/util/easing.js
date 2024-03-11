
/**
 * @param {number} t Current time
 * @param {number} b Start value
 * @param {number} c Change in value
 * @param {number} d Duration
 * @returns {number} The eased value
 * */
function easeOutQuad(t, b, c, d) {
    t = t / d - 1;
    return -c * (t * t * t * t - 1) + b;
}

module.exports = {easeOutQuad};