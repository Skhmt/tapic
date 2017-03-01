module.exports = function (TAPIC, state, _getJSON) {
  /**
  * Removes the channel from its current community.
  * @function leaveCommunity
  */
  TAPIC.leaveCommunity = function () {
    _getJSON('https://api.twitch.tv/kraken/channels/' + state.channel_id + '/community/',
      '&_method=delete',
      function (res) {
        // do nothing - there's no response from twitch
      }
    );
  };
};
