module.exports = function (state, _getJSON) {
  function _getSubBadgeUrl (callback) {
    _getJSON(
      'https://api.twitch.tv/kraken/chat/' + state.channel + '/badges',
      function (res) {
        if (res.subscriber) {
          state.subBadgeUrl = res.subscriber.image;
        }
        if (typeof callback == 'function') {
          callback();
        }
      }
    );
  }
  return _getSubBadgeUrl;
};
