module.exports = function (TAPIC, _getJSON) {
  /**
  * Takes in a username (or channel name, same thing) and returns the user's ID
  * @param  {string} username  The username to check.
  * @param  {string} callback  The user/channel id.
  * @function findID
  */
  TAPIC.findID = function (username, callback) {
    if (typeof username != 'string' || typeof callback != 'function') {
      return console.error('Invalid parameters. Usage: TAPIC.findID(username, callback);');
    }
    _getJSON(
      'https://api.twitch.tv/kraken/users',
      '&login=' + username,
      function (res) {
        callback(res.users[0]._id);
      }
    );
  };
};
