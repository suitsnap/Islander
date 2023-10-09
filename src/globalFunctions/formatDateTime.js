/**
 * Formats a date to a string 
 * @param {Date} date The date to format
 * @returns {string} The formatted date
 * */
function formatDateTime(date) {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const timeString = date.toLocaleTimeString([], options).replace(/:\d+ /, " ");
  const dateString = date.toLocaleDateString([], options).replace(/\//g, "/");
  return `${timeString} ${dateString}`;
}

module.exports = { formatDateTime };
