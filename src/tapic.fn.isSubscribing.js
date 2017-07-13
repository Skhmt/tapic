module.exports = function (TAPIC, state, _getJSON) {
  /**
  * Checks if "user" is subscribed to the current channel. This is an asynchronous function and requires a callback. Requires the channel_check_subscription permission and the username and channel must be the same.
  * @param  {string} user     The user id to check.
  * @param  {function} callback The function that's called when the check is complete. Callback is given an object with isSubscribing (boolean), dateSubscribed (string), sub_plan (string), and sub_plan_name (string).
  * @function isSubscribing
  */
  TAPIC.isSubscribing = function (user, callback) {
    if ((typeof user != 'string' && typeof user != 'number') || typeof callback != 'function') {
      console.error('Invalid parameters. Usage: TAPIC.isSubscribing(user_id, callback);');
      return;
    }
    // https://api.twitch.tv/kraken/channels/teststate.channel/subscriptions/testuser
    const url = 'https://api.twitch.tv/kraken/channels/' + state.channel_id + '/subscriptions/' + encodeURIComponent(user);
    _getJSON(
      url,
      function (res) {
        if (res.error) {
          callback({
            isSubscribing: false
          });
        } else {
          callback({
            isSubscribing: true,
            dateSubscribed: (new Date(res.created_at).toLocaleString()),
            sub_plan: res.sub_plan,
            sub_plan_name: res.sub_plan_name,
          });
        }
      }
    );
  };

};
