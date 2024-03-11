function sanitiseUsername(username) {
    return username.replace(/_/g, '\\_');
}

module.exports = {sanitiseUsername}