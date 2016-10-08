module.exports = function (TAPIC, state, _ws, _getSubBadgeUrl, _pingAPI, _refreshRate) {
  /**
  * Joins a new channel. If you were already in a channel, this exits you from that channel first, then joins the new one.
  * @param  {string} channel The channel name, with or without the #.
  * @param  {function} callback Optional callback that's triggered after the Twitch API has been polled for the first time after joining.
  * @function joinChannel
  */
  TAPIC.joinChannel = function (channel, callback) {
    if (typeof channel != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.joinChannel(channel);');
      return;
    }
    if (!_ws) {
      return console.error('Tapic not setup.');
    }

    if (state.channel) _ws.send('PART #' + state.channel);

    state.channel = channel.replace('#', '');
    state.online = false;
    state.game = '';
    state.status = '';
    state.followerCount = '';
    state.totalViewCount = '';
    state.partner = '';
    state.currentViewCount = '';
    state.fps = '';
    state.videoHeight = '';
    state.delay = '';
    state.subBadgeUrl = '';
    state.chatters = {};
    state.followers = [];
    state.createdAt = '';
    state.logo = '';
    state.videoBanner = '';
    state.profileBanner = '';
    state.userMod = '';
    state.userSub = '';
    state.userTurbo = '';
    state.userType = '';

    _ws.send('JOIN #' + state.channel);

    _getSubBadgeUrl();
    if (typeof callback == 'function') {
      _pingAPI(_refreshRate, callback);
    } else {
      _pingAPI(_refreshRate);
    }
  };
};
