module.exports = function (state, _event, _getJSON) {

  function _pingAPI (callback) {
    if (!state.channel_id) return;

    let streams = false;
    let channels = false;
    let follows = false;
    let chatters = false;
    let community = false;
    let teams = false;

    function _pingFinished() {
      if (streams && channels && follows && chatters && community && teams) {
        if (typeof callback === 'function') callback();
        _event('update');
      }
    }

    _getJSON(
      'https://api.twitch.tv/kraken/streams/' + state.channel_id,
      function (res) {
        if (res.stream) {
          state.online = true;
          state.currentViewCount = res.stream.viewers;
          state.fps = res.stream.average_fps;
          state.videoHeight = res.stream.video_height;
          state.delay = res.stream.delay;
          state.preview = res.stream.preview.large;
        } else {
          state.online = false;
        }

        streams = true;
        _pingFinished();
      }
    );

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel_id,
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
      'https://api.twitch.tv/kraken/channels/' + state.channel_id + '/community',
      function (res) {
        if (res) {
          state.community.name = res.name;
          state.community.description = res.rescription;
          state.community.descriptionHTML = res.description_html;
          state.community.rules = res.rules;
          state.community.rulesHTML = res.rules_html;
          state.community.summary = res.summary;
        }
        else {
          state.community.name = '';
          state.community.description = '';
          state.community.descriptionHTML = '';
          state.community.rules = '';
          state.community.rulesHTML = '';
          state.community.summary = '';
        }

        community = true;
        _pingFinished();
      }
    );

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel_id + '/follows',
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

    // This is an undocumented/supported API - it hasn't been updated to v5. It uses channel NAME
    _getJSON(
      'https://tmi.twitch.tv/group/user/' + state.channel + '/chatters',
      function (res) {
        if (!require('./isNode')) { // using JSONP with this API endpoint adds "data" to the object
          res = res.data;
        }

        if (!res || !res.chatters) {
          return console.error('No response from "tmi.twitch.tv/group/user/:channel/chatters". This will happen from time to time.');
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

    _getJSON(
      'https://api.twitch.tv/kraken/channels/' + state.channel_id + '/teams',
      function (res) {
        if (typeof res.teams[0] !== 'undefined') {
          state.teamDisplayName = res.teams[0].display_name;
          state.teamName = res.teams[0].name;
        }
        else {
          state.teamDisplayName = '';
          state.teamName = '';
        }
        teams = true;
        _pingFinished();
      }
    );

    setTimeout(function () {
      if (!require('./isNode')) {
        document.getElementById('tapicJsonpContainer').innerHTML = '';
      }
      _pingAPI();
    }, state.refreshRate * 1000);
  }

  return _pingAPI;
};
