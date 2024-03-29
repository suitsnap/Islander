/**
 * Returns a string with a progress bar based on the percentage given
 * @param {number} percentage - The percentage of the bar that should be filled
 * @returns {string} - The string with the progress bar
 * */
function getBar(percentage) {
    let bar = "[";
    if (percentage === 0) {
        bar += "░░░░░░░░░░";
    } else if (percentage % 10 === 0) {
        bar += "▓".repeat(percentage / 10);
        bar += "░".repeat(10 - percentage / 10);
    } else {
        bar += "▓".repeat(Math.floor(percentage / 10));
        bar += "▒";
        bar += "░".repeat(9 - Math.floor(percentage / 10));
    }
    bar += "]";
    return bar;
}

module.exports = {getBar};
