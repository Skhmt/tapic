module.exports = function (TAPIC, state) {
  /**
  * Sets the status and game of the channel. Requires channel_editor permission.
  * @param  {string} status The status/title of the channel.
  * @param  {string} game   The game being played, or Creative or Music or whatever.
  * @function setStatusGame
  */
  TAPIC.setStatusGame = function (status, game) {
    if (typeof status != 'string' || typeof game != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.setStatusGame(status, game);');
      return;
    }

    _getJSON('https://api.twitch.tv/kraken/channels/' + state.channel_id,
      '&_method=put&channel[status]=' + encodeURIComponent(status) + '&channel[game]=' + encodeURIComponent(game),
      function (res) {
        state.game = res.game;
        state.status = res.status;
      }
    );
  };
};
