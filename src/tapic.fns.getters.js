module.exports = function (TAPIC, state) {
  /**
  * Gets the username of the bot.
  * @return {string} The lowercase username.
  * @function getUsername
  */
  TAPIC.getUsername = function () {
    return state.username;
  };

  /**
  * Gets the channel name.
  * @return {string} The channel name in lowercase.
  * @function getChannel
  */
  TAPIC.getChannel = function () {
    return state.channel;
  };

  /**
  * Gets the online status of the channel.
  * @return {boolean} True if the channel is streaming, false if not.
  * @function isOnline
  */
  TAPIC.isOnline = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.online;
  };

  /**
  * Gets the status (title) of the channel. This works even if the channel is offline.
  * @return {string} The status.
  * @function getStatus
  */
  TAPIC.getStatus = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.status;
  };

  /**
  * Gets the game being played according to the channel owner. This works even if the channel is offline.
  * @return {string} The game.
  * @function getGame
  */
  TAPIC.getGame = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.game;
  };

  /**
  * Gets the number of followers of the channel.
  * @return {number} The follower count.
  * @function getFollowerCount
  */
  TAPIC.getFollowerCount = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.followerCount;
  };

  /**
  * Gets the total (cumulative) viewer count of the channel.
  * @return {number} The total number of viewers.
  * @function getTotalViewCount
  */
  TAPIC.getTotalViewCount = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.totalViewCount;
  };

  /**
  * Gets the partner status of the channel.
  * @return {boolean} Returns true if the channel is a Twitch partner, false if not.
  * @function isPartner
  */
  TAPIC.isPartner = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.partner;
  };

  /**
  * Gets the number of current logged-in viewers of the channel.
  * @return {number} The current number of logged-in viewers.
  * @function getCurrentViewCount
  */
  TAPIC.getCurrentViewCount = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.currentViewCount;
  };

  /**
  * Gets the channel's frames per second - generally 30 or 60.
  * @return {number} The FPS of the channel.
  * @function getFps
  */
  TAPIC.getFps = function () {
    if (!state.online) return console.error('Stream not online.');
    return state.fps;
  };

  /**
  * Gets the height in pixels of the video. This is often 480, 720, or 1080.
  * @return {number} The height in pixels of the stream.
  * @function getVideoHeight
  */
  TAPIC.getVideoHeight = function () {
    if (!state.online) return console.error('Stream not online.');
    return state.videoHeight;
  };

  /**
  * Gets the delay of the channel. This doesn't return the actual delay, just the intentionally added delay.
  * @return {number} The delay in seconds.
  * @function getDelay
  */
  TAPIC.getDelay = function () {
    if (!state.online) return console.error('Stream not online.');
    return state.delay;
  };

  /**
  * Gets the URL of the subscriber badge displayed to the left of the username in chat if the channel is partnered.
  * @return {string} The URL of the sub badge.
  * @function getSubBadgeUrl
  */
  TAPIC.getSubBadgeUrl = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.subBadgeUrl;
  };

  /**
  * Gets the current chatters in the channel. The returned object has 5 arrays: moderators, staff, admins, global_mods, and viewers. The arrays are simple lists of the viewers that belong to each category.
  * @return {object} An object of arrays.
  * @function getChatters
  */
  TAPIC.getChatters = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.chatters;
  };

  /**
  * Gets the time the stream started in the W3C date and time format, in UTC. ex: 2014-09-20T21:00:43Z
  * @return {string} The time the stream started.
  * @function getCreatedAt
  */
  TAPIC.getCreatedAt = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.createdAt;
  };

  /**
  * Gets the channel's 300x300px logo URL.
  * @return {string} The URL of the channel's logo.
  * @function getLogo
  */
  TAPIC.getLogo = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.logo;
  };

  /**
  * Gets the channel's offline video banner/image URL.
  * @return {string} The URL of the channel's offline image.
  * @function getVideoBanner
  */
  TAPIC.getVideoBanner = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.videoBanner;
  };

  /**
  * Gets the channel's profile banner URL.
  * @return {string} The URL of the channel's profile banner.
  * @function getProfileBanner
  */
  TAPIC.getProfileBanner = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.profileBanner;
  };

  /**
  * Gets the display name of the user. This includes capitalization preferences.
  * @return {string} The display name of the user.
  * @function getDisplayName
  */
  TAPIC.getDisplayName = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.userDisplayName;
  };

  /**
  * Gets the user's color preference for their username in chat. The format is hex and includes the leading #.
  * @return {string} Color of the username.
  * @function getColor
  */
  TAPIC.getColor = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.userColor;
  };

  /**
  * Gets the user's emote set in comma-delimited format.
  * @return {string} List of the user's emote sets.
  * @function getEmoteSets
  */
  TAPIC.getEmoteSets = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.userEmoteSets;
  };

  /**
  * Gets the moderator status of the user in the channel.
  * @return {boolean} True if a moderator, false if not.
  * @function getMod
  */
  TAPIC.getMod = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return (state.userMod == 1);
  };

  /**
  * Gets the subscriber status of the user in the channel.
  * @return {boolean} True if a subscriber, false if not.
  * @function getSub
  */
  TAPIC.getSub = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return (state.userSub == 1);
  };

  /**
  * Gets the turbo status of the user.
  * @return {boolean} True if turbo, false if not.
  * @function getTurbo
  */
  TAPIC.getTurbo = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return (state.userTurbo == 1);
  };

  /**
  * Gets the user's usertype. For example, "staff".
  * @return {string} User's user type.
  * @function getUserType
  */
  TAPIC.getUserType = function () {
    if (!state.channel) return console.error('Not in a channel.');
    return state.userType;
  };
};
