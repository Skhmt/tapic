/**
* @overview Twitch API & Chat in javascript.
* @author Skhmt
* @license MIT
* @version 3.1.4
*
* @module TAPIC
*/

/*jshint
  esversion: 6,
  unused: true,
  undef: true,
  node: true
*/

(function () {

  function define_TAPIC() {

    var _refreshRate = 5; // check the Twitch API every [this many] seconds

    var TAPIC = {}; // this is the return object
    var _clientid = '';
    var _oauth = '';
    var _username = '';
    var _ws;
    var _isNode = false;
    var _events = new Map();

    var _channel = '';
    var _online = false;
    var _game = '';
    var _status = '';
    var _followerCount = '';
    var _totalViewCount = '';
    var _partner = '';
    var _currentViewCount = '';
    var _fps = '';
    var _videoHeight = '';
    var _delay = '';
    var _subBadgeUrl = '';
    var _chatters = {};
    var _followers = [];
    var _createdAt = '';
    var _logo = '';
    var _videoBanner = '';
    var _profileBanner = '';
    var _userDisplayName = '';
    var _userColor = '';
    var _userEmoteSets = '';
    var _userMod = '';
    var _userSub = '';
    var _userTurbo = '';
    var _userType = '';

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      _isNode = true;
    }

    /**
    * Sets the clientid and oauth, then opens a chat connection and starts polling the Twitch API for data. This needs to be done before joining a channel.
    * @param  {string} clientid Your public clientid.
    * @param  {string} oauth Your user's oauth token. See: https://github.com/justintv/Twitch-API/blob/master/authentication.md for instructions on how to do that.
    * @param  {function} callback Callback that sends the username.
    * @function setup
    */
    TAPIC.setup = function (clientid, oauth, callback) {
      if (typeof clientid != 'string' || typeof oauth != 'string') {
        console.error('Invalid parameters. Usage: TAPIC.setup(clientid, oauth[, callback]);');
        return;
      }
      _clientid = clientid;
      _oauth = oauth.replace('oauth:', '');

      if (!_isNode) { // node.js doesn't have a DOM
        var node = document.createElement('div');
        node.id = 'tapicJsonpContainer';
        node.style.cssText = 'display:none;';
        document.getElementsByTagName('body')[0].appendChild(node);
      }

      _getJSON(
        'https://api.twitch.tv/kraken?client_id=' + _clientid + '&oauth_token=' + _oauth + '&api_version=3',
        function (res) {
          _username = res.token.user_name;

          // setting up websockets
          var twitchWS = 'wss://irc-ws.chat.twitch.tv:443';
          if (_isNode) {
            var WS = require('ws');
            _ws = new WS(twitchWS);
          } else {
            _ws = new WebSocket(twitchWS);
          }

          // handling messages
          if (_isNode) {
            _ws.on('open', wsOpen);
            _ws.on('message', wsMessage);
          } else {
            _ws.onopen = wsOpen;
            _ws.onmessage = wsMessage;
          }

          function wsOpen() {
            _ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
            _ws.send('PASS oauth:' + _oauth);
            _ws.send('NICK ' + _username);
          }

          function wsMessage(event) {
            var messages;
            // websockets can have multiple separate messages per event
            if (_isNode) {
              messages = event.split('\r\n');
            } else {
              messages = event.data.split('\r\n');
            }

            for (var i = 0; i < messages.length; i++) {
              var msg = messages[i];
              if (msg === 'PING :tmi.twitch.tv') {
                _ws.send('PONG :tmi.twitch.tv');
              } else if (msg) {
                _parseMessage(msg);
                if (msg.substring(0,18) === ':tmi.twitch.tv 001' && typeof callback == 'function') callback(_username);
              }
            }
          }
        }
      );
    };

    /**
    * Joins a new channel. If you were already in a channel, this exits you from that channel first, then joins the new one.
    * @param  {string} channel The channel name, with or without the #.
    * @param  {function}  callback  Optional callback that's triggered once after the Twitch API has been polled the first time
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

      if (_channel) _ws.send('PART #' + _channel);

      _channel = channel.replace('#', '');
      _online = false;
      _game = '';
      _status = '';
      _followerCount = '';
      _totalViewCount = '';
      _partner = '';
      _currentViewCount = '';
      _fps = '';
      _videoHeight = '';
      _delay = '';
      _subBadgeUrl = '';
      _chatters = {};
      _followers = [];
      _createdAt = '';
      _logo = '';
      _videoBanner = '';
      _profileBanner = '';
      _userMod = '';
      _userSub = '';
      _userTurbo = '';
      _userType = '';

      _ws.send('JOIN #' + _channel);

      _getSubBadgeUrl();
      if (typeof callback == 'function') {
        _pingAPI(_refreshRate, callback);
      } else {
        _pingAPI(_refreshRate);
      }
    };

    /**
    * Sends a message to the channel. Actions such as /me, /host, etc work as normal. This is echoed back to the client if you listen for the "echoChat" event.
    * @param  {string} message The message to send.
    * @function sendChat
    */
    TAPIC.sendChat = function (message) {
      if (typeof message != 'string') {
        console.error('Invalid parameters. Usage: TAPIC.sendChat(message);');
        return;
      }
      if (!_ws) {
        return console.error('Tapic not setup.');
      }
      _ws.send('PRIVMSG #' + _channel + ' :' + message);
      _event('echoChat', message);
    };

    /**
    * Sends a whisper to a user. This is echoed back to the client if you listen for the "echoWhisper" event.
    * @param  {string} user The target user to send the whisper to.
    * @param  {string} message The message to send.
    * @function sendWhisper
    */
    TAPIC.sendWhisper = function (user, message) {
      if (typeof user != 'string' || typeof message != 'string') {
        console.error('Invalid parameters. Usage: TAPIC.sendWhisper(user, message);');
        return;
      }
      if (!_ws) {
        return console.error('Tapic not setup.');
      }
      _ws.send('PRIVMSG #jtv :/w ' + user + ' ' + message);
      _event('echoWhisper', {
        to: user,
        text: message
      });
    };

    /**
    * Gets the username of the bot.
    * @return {string} The lowercase username.
    * @function getUsername
    */
    TAPIC.getUsername = function () {
      return _username;
    };

    /**
    * Gets the channel name.
    * @return {string} The channel name in lowercase.
    * @function getChannel
    */
    TAPIC.getChannel = function () {
      return _channel;
    };

    /**
    * Gets the online status of the channel.
    * @return {boolean}  True if the channel is streaming, false if not.
    * @function isOnline
    */
    TAPIC.isOnline = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _online;
    };

    /**
    * Gets the status (title) of the channel. This works even if the channel is offline.
    * @return {string}  The status.
    * @function getStatus
    */
    TAPIC.getStatus = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _status;
    };

    /**
    * Gets the game being played according to the channel owner. This works even if the channel is offline.
    * @return {string}  The game.
    * @function getGame
    */
    TAPIC.getGame = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _game;
    };

    /**
    * Gets the number of followers of the channel.
    * @return {number}  The follower count.
    * @function getFollowerCount
    */
    TAPIC.getFollowerCount = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _followerCount;
    };

    /**
    * Gets the total (cumulative) viewer count of the channel.
    * @return {number}  The total number of viewers.
    * @function getTotalViewCount
    */
    TAPIC.getTotalViewCount = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _totalViewCount;
    };

    /**
    * Gets the partner status of the channel.
    * @return {boolean}  Returns true if the channel is a Twitch partner, false if not.
    * @function isPartner
    */
    TAPIC.isPartner = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _partner;
    };

    /**
    * Gets the number of current logged-in viewers of the channel.
    * @return {number}  The current number of logged-in viewers.
    * @function getCurrentViewCount
    */
    TAPIC.getCurrentViewCount = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _currentViewCount;
    };

    /**
    * Gets the channel's frames per second - generally 30 or 60.
    * @return {number}  The FPS of the channel.
    * @function getFps
    */
    TAPIC.getFps = function () {
      if (!_online) return console.error('Stream not online.');
      return _fps;
    };

    /**
    * Gets the height in pixels of the video. This is often 480, 720, or 1080.
    * @return {number}  The height in pixels of the stream.
    * @function getVideoHeight
    */
    TAPIC.getVideoHeight = function () {
      if (!_online) return console.error('Stream not online.');
      return _videoHeight;
    };

    /**
    * Gets the delay of the channel. This doesn't return the actual delay, just the intentionally added delay.
    * @return {number}  The delay in seconds.
    * @function getDelay
    */
    TAPIC.getDelay = function () {
      if (!_online) return console.error('Stream not online.');
      return _delay;
    };

    /**
    * Gets the URL of the subscriber badge displayed to the left of the username in chat if the channel is partnered.
    * @return {string}  The URL of the sub badge.
    * @function getSubBadgeUrl
    */
    TAPIC.getSubBadgeUrl = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _subBadgeUrl;
    };

    /**
    * Gets the current chatters in the channel. The returned object has 5 arrays: moderators, staff, admins, global_mods, and viewers. The arrays are simple lists of the viewers that belong to each category.
    * @return {object}  An object of arrays.
    * @function getChatters
    */
    TAPIC.getChatters = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _chatters;
    };

    /**
    * Gets the time the stream started in the W3C date and time format, in UTC. ex: 2014-09-20T21:00:43Z
    * @return {string}  The time the stream started.
    * @function getCreatedAt
    */
    TAPIC.getCreatedAt = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _createdAt;
    };

    /**
    * Gets the channel's 300x300px logo URL.
    * @return {string}  The URL of the channel's logo.
    * @function getLogo
    */
    TAPIC.getLogo = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _logo;
    };

    /**
    * Gets the channel's offline video banner/image URL.
    * @return {string}  The URL of the channel's offline image.
    * @function getVideoBanner
    */
    TAPIC.getVideoBanner = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _videoBanner;
    };

    /**
    * Gets the channel's profile banner URL.
    * @return {string}  The URL of the channel's profile banner.
    * @function getProfileBanner
    */
    TAPIC.getProfileBanner = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _profileBanner;
    };

    /**
    * Gets the display name of the user. This includes capitalization preferences.
    * @return {string}  The display name of the user.
    * @function getDisplayName
    */
    TAPIC.getDisplayName = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _userDisplayName;
    };

    /**
    * Gets the user's color preference for their username in chat. The format is hex and includes the leading #.
    * @return {string}  Color of the username.
    * @function getColor
    */
    TAPIC.getColor = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _userColor;
    };

    /**
    * Gets the user's emote set in comma-delimited format.
    * @return {string}  List of the user's emote sets.
    * @function getEmoteSets
    */
    TAPIC.getEmoteSets = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _userEmoteSets;
    };

    /**
    * Gets the moderator status of the user in the channel.
    * @return {boolean}  True if a moderator, false if not.
    * @function getMod
    */
    TAPIC.getMod = function () {
      if (!_channel) return console.error('Not in a channel.');
      return (_userMod == 1);
    };

    /**
    * Gets the subscriber status of the user in the channel.
    * @return {boolean}  True if a subscriber, false if not.
    * @function getSub
    */
    TAPIC.getSub = function () {
      if (!_channel) return console.error('Not in a channel.');
      return (_userSub == 1);
    };

    /**
    * Gets the turbo status of the user.
    * @return {boolean}  True if turbo, false if not.
    * @function getTurbo
    */
    TAPIC.getTurbo = function () {
      if (!_channel) return console.error('Not in a channel.');
      return (_userTurbo == 1);
    };

    /**
    * Gets the user's usertype. For example, "staff".
    * @return {string}  User's user type.
    * @function getUserType
    */
    TAPIC.getUserType = function () {
      if (!_channel) return console.error('Not in a channel.');
      return _userType;
    };

    /**
    * Checks if "user" is following "channel". This is an asynchronous function and requires a callback.
    * @param  {string} user     The user name to check.
    * @param  {string} channel  The channel to check.
    * @param  {function} callback The function that's called when the check is complete. Callback is given an object with isFollowing (boolean) and dateFollowed (string).
    * @function isFollowing
    */
    TAPIC.isFollowing = function (user, channel, callback) {
      // https://api.twitch.tv/kraken/users/skhmt/follows/channels/food
      if (typeof user != 'string' || typeof channel != 'string' || typeof callback != 'function') {
        console.error('Invalid parameters. Usage: TAPIC.isFollowing(user, channel, callback);');
        return;
      }
      _getJSON(
        'https://api.twitch.tv/kraken/users/' + user + '/follows/channels/' + channel + '?api_version=3&client_id=' + _clientid,
        function (res) {
          if (res.error) callback({
            isFollowing: false
          });
          else callback({
            isFollowing: true,
            dateFollowed: (new Date(res.created_at).toLocaleString())
          });
        }
      );
    };

    /**
    * Checks if "user" is subscribed to the current channel. This is an asynchronous function and requires a callback. Requires the channel_check_subscription permission and the username and channel must be the same.
    * @param  {string} user     The user name to check.
    * @param  {function} callback The function that's called when the check is complete. Callback is given an object with isSubscribing (boolean) and dateSubscribed (string).
    * @function isSubscribing
    */
    TAPIC.isSubscribing = function (user, channel, callback) {
      if (typeof user != 'string' || typeof callback != 'function') {
        console.error('Invalid parameters. Usage: TAPIC.isSubscribing(user, callback);');
        return;
      }
      // https://api.twitch.tv/kraken/channels/test_channel/subscriptions/testuser
      _getJSON(
        'https://api.twitch.tv/kraken/channels/' + _channel + '/subscriptions/' + user + '?api_version=3client_id=' + _clientid,
        function (res) {
          if (res.error) {
            callback({
              isSubscribing: false
            });
          } else {
            callback({
              isSubscribing: true,
              dateSubscribed: (new Date(res.created_at).toLocaleString())
            });
          }
        }
      );
    };

    /**
    * Runs a commercial. Requires channel_commercial permission and the user must be an editor of the channel or the username must be the same as the channel. Commercials usually run for 30 seconds.
    * @param  {number} length Amount of time to run the commercial in seconds.
    * @function runCommercial
    */
    TAPIC.runCommercial = function (length) {
      if (typeof length != 'number') {
        console.error('Invalid parameters. Usage: TAPIC.runCommercial(length);');
        return;
      }
      if (!_channel) return console.error('Not in a channel.');
      if (!_partner) return console.error('Not a partner, cannot run a commercial.');

      var host = 'https://api.twitch.tv';
      var path = '/kraken/channels/' + _channel + '/commercial?oauth_token=' + _oauth;
      var url = host + path;

      if (_isNode) {
        var options = {
          host: host,
          path: path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Client-ID': _clientid
          }
        };
        var http = require('https');
        http.request(options).write('length=' + length).end();
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('Client-ID', _clientid);
        xhr.send('length=' + length);
      }
    };

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

      var host = 'https://api.twitch.tv';
      var path = '/kraken/channels/' + _channel;
          path += '?channel[status]=' + encodeURIComponent(status);
          path += '&channel[game]=' + encodeURIComponent(game);
          path += '&_method=put&oauth_token=' + _oauth;

      if (_isNode) {
        var options = {
          host: host,
          path: path,
          headers: {
            'Client-ID': _clientid
          }
        };
        var http = require('https');
        http.get(options, function (res) {
          var output = '';
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            output += chunk;
          });
          res.on('end', function () {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              var resp = JSON.parse(output);
              _game = resp.game;
              _status = resp.status;
            } else { // error
              console.error(output);
            }
          });
        }).on('error', function (e) {
          console.error(e.message);
        });
      } else { // vanilla JS
        var xhr = new XMLHttpRequest();
        xhr.open('GET', host + path, true);
        xhr.setRequestHeader('Client-ID', _clientid);
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 400) {
            var resp = JSON.parse(xhr.responseText);
            _game = resp.game;
            _status = resp.status;
          } else {
            // We reached our target server, but it returned an error
            console.error(xhr.responseText);
          }
        };
        xhr.onerror = function () {
          // There was a connection error of some sort
          console.error(xhr.responseText);
        };
        xhr.send();
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Private functions
    ////////////////////////////////////////////////////////////////////////////

    function _parseTags(tagString) {
      var output = new Map();

      // remove leading '@' then split by ';'
      var tagArray = tagString.substring(1).split(';');

      // add to map
      for (var p = 0; p < tagArray.length; p++) {
        var option = tagArray[p].split('=');
        output.set(option[0], option[1]);
      }

      return output;
    }

    function _parseMessage(text) {
      _event('raw', text);
      var textarray = text.split(' ');

      if (textarray[2] === 'PRIVMSG') { // chat
        // :twitch_username!twitch_username@twitch_username.tmi.twitch.tv PRIVMSG #channel :message here
        _msgPriv(textarray);
      } else if (textarray[1] === 'PRIVMSG') { // host
        _event('host', textarray[3].substring(1));
      } else if (textarray[2] === 'NOTICE') {
        // @msg-id=slow_off :tmi.twitch.tv NOTICE #channel :This room is no longer in slow mode.
        _msgNotice(textarray);
      } else if (textarray[1] === 'JOIN') {
        // :twitch_username!twitch_username@twitch_username.tmi.twitch.tv JOIN #channel
        _msgJoin(textarray);
      } else if (textarray[1] === 'PART') {
        // :twitch_username!twitch_username@twitch_username.tmi.twitch.tv PART #channel
        _msgPart(textarray);
      } else if (textarray[2] === 'ROOMSTATE') {
        // @broadcaster-lang=;r9k=0;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #channel
        _msgRoomstate(textarray);
      } else if (textarray[2] === 'WHISPER') {
        // @badges=;color=#FF69B4;display-name=littlecatbot;emotes=;message-id=21;thread-id=71619374_108640872;turbo=0;user-id=108640872;user-type= :littlecatbot!littlecatbot@littlecatbot.tmi.twitch.tv WHISPER skhmt :hello world
        _msgWhisper(textarray);
      } else if (textarray[1] === 'CLEARCHAT') { // clear chat
        // :tmi.twitch.tv CLEARCHAT #channel
        _event('clearChat');
      } else if (textarray[2] === 'CLEARCHAT') { // ban/timeout
        // @ban-duration=1;ban-reason=Follow\sthe\srules :tmi.twitch.tv CLEARCHAT #channel :target_username
        // @ban-reason=Follow\sthe\srules :tmi.twitch.tv CLEARCHAT #channel :target_username
        _msgBan(textarray);
      } else if (textarray[2] === 'USERSTATE') {
        // @color=#0D4200;display-name=UserNaME;emote-sets=0,33;mod=1;subscriber=1;turbo=1;user-type=staff :tmi.twitch.tv USERSTATE #channel
        _msgUserstate(textarray);
      } else if (textarray[2] === 'USERNOTICE') { // sub notifications for now, may change in the future
        // @badges=staff/1,broadcaster/1,turbo/1;color=#008000;display-name=TWITCH_UserName;emotes=;mod=0;msg-id=resub;msg-param-months=6;room-id=1337;subscriber=1;system-msg=TWITCH_UserName\shas\ssubscribed\sfor\s6\smonths!;login=twitch_username;turbo=1;user-id=1337;user-type=staff :tmi.twitch.tv USERNOTICE #channel :Great stream -- keep it up!
        _msgSub(textarray);
      } else {
        // if ( text ) console.info( text );
      }
    }

    function _msgWhisper(textarray) {
      var whisperTags = _parseTags(textarray[0]);

      // some people don't have a display-name, so getting it from somewhere else as a backup
      if (!whisperTags.get('display-name')) {
        whisperTags.set('display-name', textarray[1].split('!')[0].substring(1));
      }

      if (!whisperTags.get('color')) {
        whisperTags.set('color', '#d2691e');
      }

      whisperTags.set('badges', whisperTags.get('badges').split(','));

      var joinedText = textarray.slice(4).join(' ').substring(1);

      _event('whisper', {
        from: whisperTags.get('display-name'),
        to: textarray[3],
        color: whisperTags.get('color'),
        emotes: whisperTags.get('emotes'),
        turbo: whisperTags.get('turbo'),
        message_id: whisperTags.get('message-id'),
        thread_id: whisperTags.get('thread-id'),
        user_id: whisperTags.get('user-id'),
        text: joinedText,
        badges: whisperTags.get('badges')
      });
    }

    function _msgPriv(textarray) {
      var msgTags = _parseTags(textarray[0]);

      if (!msgTags.get('display-name')) msgTags.set('display-name', textarray[1].split('!')[0].substring(1));

      if (!msgTags.get('color')) msgTags.set('color', '#d2691e');

      msgTags.set('badges', msgTags.get('badges').split(','));

      var action = false;
      var text = textarray.slice(4);
      text[0] = text[0].substring(1); // removing colon
      var unicodeSOH = '\u0001';
      if (text[0] === unicodeSOH + 'ACTION') {
        text = text.slice(1); // remove the word 'ACTION'
        action = true;
      }
      var joinedText = text.join(' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (msgTags.get('display-name') === 'twitchnotify') { // sub notification
        if (text[1] === 'just') { // "[name] just subscribed!"
          _event('sub', text[0]);
        } else { // "[number] viewers resubscribed while you were away!"
          _event('subsAway', text[0]);
        }
      } else { // regular message
        _event('message', {
          from: msgTags.get('display-name'),
          color: msgTags.get('color'),
          mod: (msgTags.get('mod') == 1),
          sub: (msgTags.get('subscriber') == 1),
          turbo: (msgTags.get('turbo') == 1),
          streamer: (msgTags.get('display-name').toLowerCase() === _channel.toLowerCase()),
          action: action,
          text: joinedText,
          emotes: msgTags.get('emotes'),
          badges: msgTags.get('badges'),
          room_id: msgTags.get('room-id'),
          user_id: msgTags.get('user-id')
        });
      }
    }

    function _msgNotice(textarray) {
      textarray.splice(0, 4);
      var output = textarray.join(' ').substring(1);
      _event('notice', output);
    }

    function _msgJoin(textarray) {
      var joinname = textarray[0].split('!')[0].substring(1);
      _event('join', joinname);
    }

    function _msgPart(textarray) {
      var partname = textarray[0].split('!')[0].substring(1);
      _event('part', partname);
    }

    function _msgRoomstate(textarray) {
      var roomstateTags = _parseTags(textarray[0]);
      _event('roomstate', {
        lang: roomstateTags.get('broadcaster-lang'),
        r9k: roomstateTags.get('r9k'),
        slow: roomstateTags.get('slow'),
        subs_only: roomstateTags.get('subs-only')
      });
    }

    function _msgBan(textarray) {
      var clearinfoarray = textarray[0].slice(1).split(';'); // remove leading '@' and split
      var banreason = '';
      var banduration = 1;
      for (var j = 0; j < clearinfoarray.length; j++) {
        var clearinfoparams = clearinfoarray[j].split('=');
        if (clearinfoparams[0] === 'ban-duration') {
          banduration = clearinfoparams[1];
        } else if (clearinfoparams[0] === 'ban-reason') {
          banreason = clearinfoparams[1].replace(/\\s/g, ' ');
        }
      }
      var clearname = textarray[4].slice(1); // remove leading ':'
      _event('clearUser', {
        name: clearname,
        reason: banreason,
        duration: banduration
      });
    }

    function _msgUserstate(textarray) {
      var userstateTags = _parseTags(textarray[0]);
      _userColor = userstateTags.get('color');
      _userDisplayName = userstateTags.get('display-name');
      _userEmoteSets = userstateTags.get('emote-sets');
      _userMod = userstateTags.get('mod');
      _userSub = userstateTags.get('subscriber');
      _userTurbo = userstateTags.get('turbo');
      _userType = userstateTags.get('user-type');
    }

    function _msgSub(textarray) {
      var usernoticeParams = _parseTags(textarray[0]);

      var joinedText = textarray.slice(4).join(' ').substring(1);

      _event('subMonths', {
        name: usernoticeParams.get('display-name'),
        months: usernoticeParams.get('msg-param-months'),
        message: joinedText
      });
    }

    function _pingAPI(refresh, callback) {

      if (!_channel) return;

      var streams = false;
      var channels = false;
      var follows = false;
      var chatters = false;

      _getJSON(
        'https://api.twitch.tv/kraken/streams/' + _channel + '?client_id=' + _clientid + '&api_version=3',
        function(res) {
          if (res.stream) {
            _online = true;
            _currentViewCount = res.stream.viewers;
            _fps = res.stream.average_fps;
            _videoHeight = res.stream.video_height;
            _delay = res.stream.delay;
          } else {
            _online = false;
          }

          streams = true;
          if (streams && channels && follows && chatters && typeof callback == 'function') callback();
        }
      );

      _getJSON(
        'https://api.twitch.tv/kraken/channels/' + _channel + '?client_id=' + _clientid + '&api_version=3',
        function(res) {
          _game = res.game;
          _status = res.status;
          _followerCount = res.followers;
          _totalViewCount = res.views;
          _partner = res.partner;
          _createdAt = res.created_at;
          _logo = res.logo;
          _videoBanner = res.video_banner; // offline banner
          _profileBanner = res.profile_banner;

          channels = true;
          if (streams && channels && follows && chatters && typeof callback == 'function') callback();
        }
      );

      _getJSON(
        'https://api.twitch.tv/kraken/channels/' + _channel + '/follows?client_id=' + _clientid + '&api_version=3&limit=100',
        function(res) {
          // https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows
          if (!res.follows) return;

          var firstUpdate = true;
          if (_followers.length > 0) firstUpdate = false;

          for (var i = 0; i < res.follows.length; i++) {
            var tempFollower = res.follows[i].user.display_name;
            if (_followers.indexOf(tempFollower) === -1) { // if user isn't in _followers
              if (!firstUpdate) {
                _event('follow', tempFollower); // if it's not the first update, post new follower
              }
              _followers.push(tempFollower); // add the user to the follower list
            }
          }

          follows = true;
          if (streams && channels && follows && chatters && typeof callback == 'function') callback();
        }
      );

      _getJSON(
        'https://tmi.twitch.tv/group/user/' + _channel + '/chatters?client_id=' + _clientid + '&api_version=3',
        function(res) {
          if (!_isNode) { // using _getJSON with this API endpoint adds "data" to the object
            res = res.data;
          }

          if (!res.chatters) {
            return console.log('No response for user list.');
          }
          _currentViewCount = res.chatter_count;
          // .slice(); is to set by value rather than reference
          _chatters.moderators = res.chatters.moderators.slice();
          _chatters.staff = res.chatters.staff.slice();
          _chatters.admins = res.chatters.admins.slice();
          _chatters.global_mods = res.chatters.global_mods.slice();
          _chatters.viewers = res.chatters.viewers.slice();

          chatters = true;
          if (streams && channels && follows && chatters && typeof callback == 'function') callback();
        }
      );

      setTimeout(function () {
        if (!_isNode) {
          document.getElementById('tapicJsonpContainer').innerHTML = '';
        }
        _pingAPI(refresh);
      }, refresh * 1000);
    }

    // This is only needed once per channel and it requires its own ajax call, so it isn't included in _pingAPI()
    function _getSubBadgeUrl(callback) {
      _getJSON(
        'https://api.twitch.tv/kraken/chat/' + _channel + '/badges?api_version=3&client_id=' + _clientid,
        function(res) {
          if (res.subscriber) {
            _subBadgeUrl = res.subscriber.image;
          }
          if (typeof callback == 'function') {
            callback();
          }
        }
      );
    }

    function _getJSON(url, callback) {
      if (typeof callback !== 'function') return console.error('Callback needed.');
      if (_isNode) { // No jsonp required, so using http.get
        var http = require('https');
        http.get(url, function (res) {
          var output = '';
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            output += chunk;
          });
          res.on('end', function () {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              callback(JSON.parse(output));
            } else { // error
              console.error(output);
            }
          });
        }).on('error', function (e) {
            console.error(e.message);
        });
      } else {
        // Keep trying to make a random callback name until it finds a unique one.
        var randomCallback;
        do {
          randomCallback = 'tapicJSONP' + Math.floor(Math.random() * 65536);
        } while (window[randomCallback]);

        window[randomCallback] = function (json) {
          callback(json);
          delete window[randomCallback]; // Cleanup the window object
        };

        var node = document.createElement('script');
        node.src = url + '&callback=' + randomCallback;
        document.getElementById('tapicJsonpContainer').appendChild(node);
      }
    }

    ////////////////////////////////////////////////////////////////////////////
    // Event system
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Listens for certain events, then runs the callback.
    * @param  {string} eventName The name of the event.
    * @param  {function} callback  What do do when the event happens.
    * @function listen
    */
    TAPIC.listen = function (eventName, callback) {
      if (typeof eventName != 'string') {
        console.error('Invalid parameters. Usage: TAPIC.listen(eventName[, callback]);');
        return;
      }
      if (typeof callback !== 'function') return console.error('Callback needed.');
      if (_events.has(eventName)) { // if there are listeners for eventName
        var value = _events.get(eventName); // get the current array of callbacks
        value.push(callback); // add the new callback
        _events.set(eventName, value); // replace the old callback array
      } else { // if eventName has no listeners
        _events.set(eventName, [callback]);
      }
    };

    /**
    * Emits an event.
    * @param  {string} eventName   The name of the event.
    * @param  {any} eventDetail The parameter to send the callback.
    * @function emit
    */
    TAPIC.emit = function (eventName, eventDetail) {
      if (typeof eventName != 'string' || typeof eventDetail != 'string') {
        console.error('Invalid parameters. Usage: TAPIC.emit(eventName, eventDetail);');
        return;
      }
      _event(eventName, eventDetail);
    };

    function _event(eventName, eventDetail) {
      if (_events.has(eventName)) {
        var callbacks = _events.get(eventName); // gets an array of callback functions
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i](eventDetail); // runs each and sends them eventDetail as the parameter
        }
      }
    }

    /**
    * Every RAW TMI message from the standard chat server. You most likely won't be using this unless you need to parse for something that TAPIC.js doesn't already have a listener for.
    * @event raw
    * @property {string} - The raw message
    */

    /**
    * A regular message (PRIVMSG in IRC). This includes actions (/me).
    * @event message
    * @property {string} from - The username of the person who sent the message.
    * @property {string} text - The text of the message.
    * @property {string} color - The color of the user name.
    * @property {string} emotes - The emote id and character locations. See: https://github.com/justintv/Twitch-API/blob/master/IRC.md#privmsg.
    * @property {boolean} action - True if it is an action (/me), false if it is a regular message.
    * @property {boolean} streamer - True if the streamer (channel name) sent the message, false if it is anyone else.
    * @property {boolean} mod - True if the user that sent the message is a moderator, false if not.
    * @property {boolean} sub - True if the user that sent the message is a subscriber, false if not.
    * @property {boolean} turbo - True if the user that sent the message has turbo, false if not.
    * @property {array} badges - Array of badges, such as 'broadcaster/1', 'subscriber/1', and 'warcraft/alliance'.
    * @property {number} room_id - The chatroom ID of the room the message was sent to.
    * @property {number} user_id - The Twitch ID number of the user that sent the message.
    */

    /**
    * A whisper sent to the user.
    * @event whisper
    * @property {string} from - The username of the person who sent the message.
    * @property {string} to - The recipient of the whisper (the bot name).
    * @property {string} text - The text of the message.
    * @property {string} color - The color of the user name.
    * @property {boolean} turbo - True if the user that sent the message has turbo, false if not.
    * @property {array} badges - Array of badges, such as 'broadcaster/1', 'subscriber/1', and 'warcraft/alliance'.
    * @property {number} message_id - The message id.
    * @property {number} thread_id - The thread id.
    * @property {number} user_id - The user id.
    */

    /**
    * Echos chat messages sent by the bot to the chatroom.
    * @event echoChat
    * @property {string} - The text of the chat message.
    */

    /**
    * Echos whispers sent by the bot.
    * @event echoWhisper
    * @property {string} to - The target of the whisper.
    * @property {string} text - The text of the whisper.
    */

    /**
    * Notices from the standard chat server. For example, the response of the /mods command.
    * @event notice
    * @property {string} - The notice.
    */

    /**
    * When a user joins your channel. Fires for every user in the channel when you enter, so be careful on how you use this. This doesn't seem to be real-time, unlike real IRC.
    * @event join
    * @property {string} - The entering user's name.
    */

    /**
    * When a user leaves your channel. This doesn't seem to be real-time, unlike real IRC.
    * @event part
    * @property {string} - The parting user's name.
    */

    /**
    * This is sent when a user is timed out or banned or "purged" by a moderator. The default action should be to remove or hide all of that user's previous chat text.
    * @event clearUser
    * @property {string} name - The cleared user's name.
    * @property {string} reason - The optional reason for timeout.
    * @property {number} duration - The length of the timeout in seconds.
    */

    /**
    * This is sent when a moderator wants to purge all of the chat. The default action should be to remove or hide all of the previous chatroom text.
    * @event clearChat
    */

    /**
    * This is sent when the user (not the channel) is hosted. If the logged in user is not the broadcaster, this will not be an accurate notification of hosts. To get host notifications if you're not logged in as the broadcaster, you need to use:  http://tmi.twitch.tv/hosts?include_logins=1&target=[user id number] (Won't work on a client-side browser - no CORS/JSONP support) or https://decapi.me/twitch/hosts?channel=[channel name] (CORS support. Thanks Decicus)
    * @event host
    * @property {string} - The user that hosted you.
    */

    /**
    * This is sent when a user follows the channel. The limitation is about 100 follows per minute. Any more might get lost.
    * @event follow
    * @property {string} - The user that followed the channel.
    */

    /**
    * First time subscription notification.
    * @event sub
    * @property {string} - The user that subscribed to the channel.
    */

    /**
    * Resubscription and months and maybe message notification.
    * @event subMonths
    * @property {string} name - The name of the person that resubscribed.
    * @property {number} months - Number of months subscribed. Alternatively, number resubscribes + 1.
    * @property {string} message - Optional resub message.
    */

    /**
    * Number of subscribers since you've been offline.
    * @event subsAway
    * @property {string} - Number of subscribers.
    */

    /**
    * The roomstate options set on a room.
    * @event roomstate
    * @property {string} lang - The language of the room. Often left blank.
    * @property {boolean} r9k - True if the room is in r9k mode, false if not.
    * @property {boolean} slow - True if the room is in slow mode, false if not.
    * @property {boolean} subs_only - True if the room is in subs (and mods) only mode, false if not.
    */

    return TAPIC;
  } // define_TAPIC()


  ////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////

  // Map shim for browsers without ES6 Maps
  if (typeof Map !== 'function') {
    window.Map = function () {
      var _dict = Object.create(null);

      var map = {};

      map.size = 0;
      map.get = function (key) {
        return _dict[key];
      };
      map.set = function (key, value) {
        _dict[key] = value;
        map.size++;
      };
      map.has = function (key) {
        return !!_dict[key];
      };
      map.clear = function () {
        _dict = Object.create(null);
        map.size = 0;
      };

      return map; // return
    }; // window.Map
  }

  // exporting if node, defining as a function if browser JS
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') { // node.js
    module.exports = define_TAPIC();
  } else { // regular js
    if (typeof TAPIC === 'undefined') {
      window.TAPIC = define_TAPIC();
    } else {
      console.error('TAPIC already defined.');
    }
  }

})();
