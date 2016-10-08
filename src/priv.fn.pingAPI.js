module.exports = function (state, _event, _refreshRate) {

  let _getJSON = require('./priv.fn.getJSON')(state)

  function _pingAPI(refresh, callback) {

    if (!state.channel) return;

    let streams = false;
    let channels = false;
    let follows = false;
    let chatters = false;

    function _pingFinished() {
      if (streams && channels && follows && chatters) {
        if (typeof callback === 'function') callback();
        _event('update');
      }
    }

    _getJSON(
      'https://api.twitch.tv/kraken/streams/' + state.channel,
      function (res) {
        if (res.stream) {
          state.online = true;
          state.currentViewCount = res.stream.viewers;
          state.fps = res.stream.average_fps;
          state.videoHeight = res.stream.video_height;
          state.delay = res.stream.delay;
        } else {
          state.online = false;
        }

        streams = true;
        _pingFinished();
      }
    );

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel,
      function (res) {
        state.game = res.game;
        state.status = res.status;
        state.followerCount = res.followers;
        state.totalViewCount = res.views;
        state.partner = res.partner;
        state.createdAt = res.created_at;
        state.logo = res.logo;
        state.videoBanner = res.video_banner; // offline banner
        state.profileBanner = res.profile_banner;

        channels = true;
        _pingFinished();
      }
    );

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel + '/follows',
      '&limit=100',
      function (res) {
        // https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows
        if (!res.follows) return;

        let firstUpdate = true;
        if (state.followers.length > 0) firstUpdate = false;

        for (let i = 0; i < res.follows.length; i++) {
          const tempFollower = res.follows[i].user.display_name;
          if (state.followers.indexOf(tempFollower) === -1) { // if user isn't in state.followers
            if (!firstUpdate) {
              _event('follow', tempFollower); // if it's not the first update, post new follower
            }
            state.followers.push(tempFollower); // add the user to the follower list
          }
        }

        follows = true;
        _pingFinished();
      }
    );

    _getJSON(
      'https://tmi.twitch.tv/group/user/' + state.channel + '/chatters',
      function (res) {
        if (!require('./isNode')) { // using _getJSON with this API endpoint adds "data" to the object
          res = res.data;
        }

        if (!res.chatters) {
          return console.log('No response for user list.');
        }
        state.currentViewCount = res.chatter_count;
        // .slice(); is to set by value rather than reference
        state.chatters.moderators = res.chatters.moderators.slice();
        state.chatters.staff = res.chatters.staff.slice();
        state.chatters.admins = res.chatters.admins.slice();
        state.chatters.global_mods = res.chatters.global_mods.slice();
        state.chatters.viewers = res.chatters.viewers.slice();

        chatters = true;
        _pingFinished();
      }
    );

    setTimeout(function () {
      if (!require('./isNode')) {
        document.getElementById('tapicJsonpContainer').innerHTML = '';
      }
      _pingAPI(refresh);
    }, refresh * 1000);
  }

  return _pingAPI;
};
