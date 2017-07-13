module.exports = function (TAPIC, _getJSON) {
  /**
  * Checks if "user" is following "channel". This is an asynchronous function and requires a callback.
  * @param  {string} user     The user id to check.
  * @param  {string} channel  The channel id to check.
  * @param  {function} callback The function that's called when the check is complete. Callback is given an object with isFollowing (boolean) and dateFollowed (string).
  * @function isFollowing
  */
  TAPIC.isFollowing = function (user, channel, callback) {
    // https://api.twitch.tv/kraken/users/skhmt/follows/channels/food
    if ((typeof user != 'string' && typeof user != 'number') || 
        (typeof channel != 'string' && typeof channel != 'number) || 
         typeof callback != 'function') {
      return console.error('Invalid parameters. Usage: TAPIC.isFollowing(user_id, channel_id, callback);');
    }
    const url = 'https://api.twitch.tv/kraken/users/' + encodeURIComponent(user) + '/follows/channels/' + encodeURIComponent(channel);
    _getJSON(
      url,
      function (res) {
        if (res.created_at) callback({
          isFollowing: true,
          dateFollowed: (new Date(res.created_at).toLocaleString())
        });
        else callback({
          isFollowing: false
        });
      }
    );
  };
};
