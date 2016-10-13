/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* Twitch API & Chat in javascript.
	* @author Skhmt
	* @license MIT
	* @version 3.3.0
	*
	* @module TAPIC
	*/

	// exporting if node, defining as a global function if browser
	if (__webpack_require__(2)) module.exports = define_TAPIC();
	else window.TAPIC = define_TAPIC();

	function define_TAPIC() {

	  let TAPIC = {}; // this is the return object
	  let state = __webpack_require__(3);
	  let _ws;
	  let _refreshRate = 5; // check the Twitch API every [this many] seconds
	  let _event = __webpack_require__(4)(TAPIC);
	  let _getJSON = __webpack_require__(5)(state);
	  let _parseMessage = __webpack_require__(7)(state, _event);
	  let _pingAPI = __webpack_require__(8)(state, _event);
	  let _getSubBadgeUrl = __webpack_require__(9)(state, _getJSON);

	  /**
	  * Sets the clientid and oauth, then opens a chat connection and starts polling the Twitch API for data. This needs to be done before joining a channel.
	  * @param  {string} clientid Your public clientid.
	  * @param  {string} oauth Your user's oauth token. See: https://github.com/justintv/Twitch-API/blob/master/authentication.md for instructions on how to do that.
	  * @param  {function} callback Calls back the username when TAPIC has successfully connected to Twitch.
	  * @function setup
	  */
	  TAPIC.setup = function (clientid, oauth, callback) {
	    if (typeof clientid != 'string' || typeof oauth != 'string') {
	      console.error('Invalid parameters. Usage: TAPIC.setup(clientid, oauth[, callback]);');
	      return;
	    }
	    state.clientid = clientid;
	    state.oauth = oauth.replace('oauth:', '');

	    _getJSON('https://api.twitch.tv/kraken', function (res) {
	      if (res.error && res.error === "Bad Request") {
	        console.error('Invalid Client ID or Oauth token.');
	        return;
	      }
	      state.username = res.token.user_name;
	      _getJSON('https://api.twitch.tv/kraken/users/' + state.username, function (res) {
	        state.id = res._id;
	        _init(callback);
	      });
	    });
	  };

	  function _init(callback) {
	    // setting up websockets
	    const twitchWS = 'wss://irc-ws.chat.twitch.tv:443';
	    if (__webpack_require__(2)) {
	      let WS = __webpack_require__(10);
	      _ws = new WS(twitchWS);
	    } else {
	      _ws = new WebSocket(twitchWS);
	    }

	    __webpack_require__(11)(state, _ws, _parseMessage, callback);
	    __webpack_require__(12)(state, _event);

	    // TAPIC.joinChannel(channel, callback)
	    __webpack_require__(13)(TAPIC, state, _ws, _getSubBadgeUrl, _pingAPI, _refreshRate);

	    // TAPIC.sendChat(message)
	    __webpack_require__(14)(TAPIC, state, _ws, _event);

	    // TAPIC.sendWhisper(user, message)
	    __webpack_require__(15)(TAPIC, _ws, _event);

	    // TAPIC.isFollowing(user, channel, callback)
	    __webpack_require__(16)(TAPIC, _getJSON);

	    // TAPIC.isSubscribing(user, callback)
	    __webpack_require__(17)(TAPIC, state, _getJSON);

	    // TAPIC.get[...]
	    __webpack_require__(18)(TAPIC, state);

	    // TAPIC.runCommercial(length)
	    __webpack_require__(19)(TAPIC, state);

	    // TAPIC.setStatusGame(status, game)
	    __webpack_require__(20)(TAPIC, state);
	  } // init()

	  __webpack_require__(21);

	  return TAPIC;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
	  returns true for node.js or nw.js

	  Context   window  nw
	  browser	  object  -
	  node.js   -       -
	  nw.js	    object	object
	*/

	module.exports = (function(){
	  return (typeof window !== 'object' || typeof nw === 'object' );
	})();


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
	  clientid: '',
	  oauth: '',
	  username: '',
	  channel: '',
	  id: '',
	  online: '',
	  game: '',
	  status: '',
	  followerCount: '',
	  totalViewCount: '',
	  currentViewCount: '',
	  partner: '',
	  fps: '',
	  videoHeight: '',
	  delay: '',
	  subBadgeUrl: '',
	  chatters: {},
	  followers: {},
	  createdAt: '',
	  logo: '',
	  videoBanner: '',
	  profileBanner: '',
	  userDisplayName: '',
	  userColor: '',
	  userEmoteSets: '',
	  userMod: '',
	  userSub: '',
	  userTurbo: '',
	  userType: '',
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function (TAPIC) {
	  let _events = new Map();

	  function _event(eventName, eventDetail) {
	    if (_events.has(eventName)) {
	      let callbacks = _events.get(eventName); // gets an array of callback functions
	      for (let i = 0; i < callbacks.length; i++) {
	        callbacks[i](eventDetail); // runs each and sends them eventDetail as the parameter
	      }
	    }
	  }

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
	      let value = _events.get(eventName); // get the current array of callbacks
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

	  return _event;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (state) {
	  function _getJSON (path, params, callback) {
	    const oauthString = '?oauth_token=' + state.oauth;
	    const apiString = '&api_version=3';
	    const clientString = '&client_id=' + state.clientid;

	    let url = path + oauthString + apiString + clientString;
	    if (typeof params === 'string') {
	      url += params;
	    } else if (typeof params === 'function') {
	      callback = params;
	    }

	    if (typeof callback !== 'function') return console.error('Callback needed.');
	    if (__webpack_require__(2)) { // No jsonp required, so using http.get
	      let http = __webpack_require__(6);
	      http.get(url, function (res) {
	        let output = '';
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
	      let randomCallback;
	      do {
	        randomCallback = 'tapicJSONP' + Math.floor(Math.random() * 1000000000);
	      } while (window[randomCallback]);

	      window[randomCallback] = function (json) {
	        callback(json);
	        delete window[randomCallback]; // Cleanup the window object
	      };

	      let node = document.createElement('script');
	      node.src = url + '&callback=' + randomCallback;
	      try {
	        document.getElementById('tapicJsonpContainer').appendChild(node);
	      } catch(e) {
	        let tapicContainer = document.createElement('div');
	        tapicContainer.id = 'tapicJsonpContainer';
	        tapicContainer.style.cssText = 'display:none;';
	        document.getElementsByTagName('body')[0].appendChild(tapicContainer);
	        document.getElementById('tapicJsonpContainer').appendChild(node);
	      }

	    }
	  }
	  return _getJSON;
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require('https');

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function (state, _event) {
	  function _parseMessage(text) {
	    _event('raw', text);
	    let textarray = text.split(' ');

	    if (textarray[2] === 'PRIVMSG') {
	      // chat
	      // :twitchstate.username!twitchstate.username@twitchstate.username.tmi.twitch.tv PRIVMSG #channel :message here
	      _msgPriv(textarray);
	    } else if (textarray[1] === 'PRIVMSG') {
	      // host
	      _event('host', textarray[3].substring(1));
	    } else if (textarray[2] === 'NOTICE') {
	      // notice
	      // @msg-id=slow_off :tmi.twitch.tv NOTICE #channel :This room is no longer in slow mode.
	      _msgNotice(textarray);
	    } else if (textarray[1] === 'JOIN') {
	      // join
	      // :twitchstate.username!twitchstate.username@twitchstate.username.tmi.twitch.tv JOIN #channel
	      _msgJoin(textarray);
	    } else if (textarray[1] === 'PART') {
	      // part
	      // :twitchstate.username!twitchstate.username@twitchstate.username.tmi.twitch.tv PART #channel
	      _msgPart(textarray);
	    } else if (textarray[2] === 'ROOMSTATE') {
	      // roomstate
	      // @broadcaster-lang=;r9k=0;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #channel
	      _msgRoomstate(textarray);
	    } else if (textarray[2] === 'WHISPER') {
	      // whisper
	      // @badges=;color=#FF69B4;display-name=littlecatbot;emotes=;message-id=21;thread-id=71619374_108640872;turbo=0;user-id=108640872;user-type= :littlecatbot!littlecatbot@littlecatbot.tmi.twitch.tv WHISPER skhmt :hello world
	      _msgWhisper(textarray);
	    } else if (textarray[1] === 'CLEARCHAT') {
	      // clear chat
	      // :tmi.twitch.tv CLEARCHAT #channel
	      _event('clearChat');
	    } else if (textarray[2] === 'CLEARCHAT') {
	      // ban/timeout
	      // @ban-duration=1;ban-reason=Follow\sthe\srules :tmi.twitch.tv CLEARCHAT #channel :targetstate.username
	      // @ban-reason=Follow\sthe\srules :tmi.twitch.tv CLEARCHAT #channel :targetstate.username
	      _msgBan(textarray);
	    } else if (textarray[2] === 'USERSTATE') {
	      // userstate
	      // @color=#0D4200;display-name=UserNaME;emote-sets=0,33;mod=1;subscriber=1;turbo=1;user-type=staff :tmi.twitch.tv USERSTATE #channel
	      _msgUserstate(textarray);
	    } else if (textarray[2] === 'USERNOTICE') {
	      // sub notifications for now, may change in the future
	      // @badges=staff/1,broadcaster/1,turbo/1;color=#008000;display-name=TWITCHstate.username;emotes=;mod=0;msg-id=resub;msg-param-months=6;room-id=1337;subscriber=1;system-msg=TWITCHstate.username\shas\ssubscribed\sfor\s6\smonths!;login=twitchstate.username;turbo=1;user-id=1337;user-type=staff :tmi.twitch.tv USERNOTICE #channel :Great stream -- keep it up!
	      _msgSub(textarray);
	    } else {
	      // not recognized by anything else
	      // if ( text ) console.info( text );
	    }
	  }

	  function _parseTags(tagString) {
	    let output = new Map();

	    // remove leading '@' then split by ';'
	    const tagArray = tagString.substring(1).split(';');

	    // add to map
	    for (let p = 0; p < tagArray.length; p++) {
	      let option = tagArray[p].split('=');
	      output.set(option[0], option[1]);
	    }

	    if (output.has('badges')) {
	      let badges = output.get('badges');
	      output.set('badges', badges.split(','));
	    }
	    return output;
	  }

	  function _msgWhisper(textarray) {
	    let whisperTags = _parseTags(textarray[0]);

	    // some people don't have a display-name, so getting it from somewhere else as a backup
	    if (!whisperTags.get('display-name')) {
	      whisperTags.set('display-name', textarray[1].split('!')[0].substring(1));
	    }

	    if (!whisperTags.get('color')) {
	      whisperTags.set('color', '#d2691e');
	    }

	    const joinedText = textarray.slice(4).join(' ').substring(1);

	    _event('whisper', {
	      from: whisperTags.get('display-name'),
	      to: textarray[3],
	      color: whisperTags.get('color'),
	      emotes: whisperTags.get('emotes'),
	      turbo: (whisperTags.get('turbo') == 1),
	      message_id: whisperTags.get('message-id'),
	      thread_id: whisperTags.get('thread-id'),
	      user_id: whisperTags.get('user-id'),
	      text: joinedText,
	      badges: whisperTags.get('badges'),
	    });
	  }

	  function _msgPriv(textarray) {
	    let msgTags = _parseTags(textarray[0]);

	    if (!msgTags.get('display-name')) msgTags.set('display-name', textarray[1].split('!')[0].substring(1));

	    if (!msgTags.get('color')) msgTags.set('color', '#d2691e');

	    let action = false;
	    let text = textarray.slice(4);
	    text[0] = text[0].substring(1); // removing colon
	    const unicodeSOH = '\u0001';
	    if (text[0] === unicodeSOH + 'ACTION') {
	      text = text.slice(1); // remove the word 'ACTION'
	      action = true;
	    }
	    let joinedText = text.join(' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	    if (msgTags.get('display-name') === 'twitchnotify') { // sub notification

	      if (text[2] === 'subscribed!') { // "[name] just subscribed!"
	        _event('sub', text[0]);
	      }
	      else if (text[2] === 'subscribed') { // "[name] just subscribed with Twitch Prime!"
	        _event('subPrime', text[0]);
	      }
	      else if (text[2] === 'resubscribed') { // "[number] viewers resubscribed while you were away!"
	        _event('subsAway', text[0]);
	      }
	    } else { // regular message
	      _event('message', {
	        from: msgTags.get('display-name'),
	        color: msgTags.get('color'),
	        mod: (msgTags.get('mod') == 1),
	        sub: (msgTags.get('subscriber') == 1),
	        turbo: (msgTags.get('turbo') == 1),
	        streamer: (msgTags.get('display-name').toLowerCase() === state.channel.toLowerCase()),
	        action: action,
	        text: joinedText,
	        emotes: msgTags.get('emotes'),
	        badges: msgTags.get('badges'),
	        room_id: msgTags.get('room-id'),
	        user_id: msgTags.get('user-id'),
	        bits: msgTags.get('bits'),
	      });
	    }
	  }

	  function _msgNotice(textarray) {
	    textarray.splice(0, 4);
	    const output = textarray.join(' ').substring(1);
	    _event('notice', output);
	  }

	  function _msgJoin(textarray) {
	    const joinname = textarray[0].split('!')[0].substring(1);
	    _event('join', joinname);
	  }

	  function _msgPart(textarray) {
	    const partname = textarray[0].split('!')[0].substring(1);
	    _event('part', partname);
	  }

	  function _msgRoomstate(textarray) {
	    const roomstateTags = _parseTags(textarray[0]);
	    _event('roomstate', {
	      lang: roomstateTags.get('broadcaster-lang'),
	      r9k: roomstateTags.get('r9k'),
	      slow: roomstateTags.get('slow'),
	      subs_only: roomstateTags.get('subs-only')
	    });
	  }

	  function _msgBan(textarray) {
	    let banTags = _parseTags(textarray[0]);

	    let reason = banTags.get('ban-reason');
	    if (typeof reason === 'string') reason = reason.replace(/\\s/g, ' ');

	    let duration = banTags.get('ban-duration');
	    if (typeof duration === 'undefined') duration = 0;

	    _event('clearUser', {
	      name: textarray[4].slice(1),
	      reason: reason,
	      duration: duration
	    });
	  }

	  function _msgUserstate(textarray) {
	    const userstateTags = _parseTags(textarray[0]);
	    state.userColor = userstateTags.get('color');
	    state.userDisplayName = userstateTags.get('display-name');
	    state.userEmoteSets = userstateTags.get('emote-sets');
	    state.userMod = userstateTags.get('mod');
	    state.userSub = userstateTags.get('subscriber');
	    state.userTurbo = userstateTags.get('turbo');
	    state.userType = userstateTags.get('user-type');
	  }

	  function _msgSub(textarray) {
	    const usernoticeParams = _parseTags(textarray[0]);

	    const joinedText = textarray.slice(4).join(' ').substring(1);

	    _event('subMonths', {
	      name: usernoticeParams.get('display-name'),
	      months: usernoticeParams.get('msg-param-months'),
	      message: joinedText
	    });
	  }

	  return _parseMessage;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (state, _event, _refreshRate) {

	  let _getJSON = __webpack_require__(5)(state)

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
	        if (!__webpack_require__(2)) { // using _getJSON with this API endpoint adds "data" to the object
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
	      if (!__webpack_require__(2)) {
	        document.getElementById('tapicJsonpContainer').innerHTML = '';
	      }
	      _pingAPI(refresh);
	    }, refresh * 1000);
	  }

	  return _pingAPI;
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = function (state, _getJSON) {
	  function _getSubBadgeUrl(callback) {
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


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require('ws');

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (state, _ws, _parseMessage, callback) {
	  // handling messages
	  if (__webpack_require__(2)) {
	    _ws.on('open', wsOpen);
	    _ws.on('message', wsMessage);
	  } else {
	    _ws.onopen = wsOpen;
	    _ws.onmessage = wsMessage;
	  }

	  function wsOpen() {
	    _ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
	    _ws.send('PASS oauth:' + state.oauth);
	    _ws.send('NICK ' + state.username);
	  }

	  function wsMessage(event) {
	    let messages;
	    // websockets can have multiple separate messages per event
	    if (__webpack_require__(2)) messages = event.split('\r\n');
	    else messages = event.data.split('\r\n');

	    for (let i = 0; i < messages.length; i++) {
	      let msg = messages[i];
	      if (msg === 'PING :tmi.twitch.tv') {
	        _ws.send('PONG :tmi.twitch.tv');
	      } else if (msg) {
	        _parseMessage(msg);
	        if (msg.substring(0,18) === ':tmi.twitch.tv 001' && typeof callback == 'function') callback(state.username);
	      }
	    }
	  } // end wsMessage
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (state, _event) {
	  let ps;

	  connect();
	  function connect() {
	    const url = 'wss://pubsub-edge.twitch.tv';
	    if (__webpack_require__(2)) {
	      let WS = __webpack_require__(10);
	      ps = new WS(url);
	      ps.on('open', psOpen);
	      ps.on('message', psMessage);
	    }
	    else {
	      ps = new WebSocket(url);
	      ps.onopen = psOpen;
	      ps.onmessage = psMessage;
	    }
	  }

	  // https://dev.twitch.tv/docs/PubSub/overview/
	  function psOpen() {
	    let frame = {
	      type: 'LISTEN',
	      data: {
	        topics: [
	          'chat_moderator_actions.' + state.id + '.' + state.id,
	          'channel-bitsevents.' + state.id,
	        ],
	        auth_token: state.oauth,
	      },
	    };
	    ps.send(JSON.stringify(frame));
	    ping();
	  }

	  function ping() {
	    ps.send(JSON.stringify({type:"PING"}));
	    setTimeout(ping, 120000); // 120,000 = 2 minutes
	  }

	  function psMessage(event) {
	    let message = JSON.parse(event.data);
	    console.log(message);
	    switch (message.type) {
	      case 'PONG':
	        break;
	      case 'RECONNECT':
	        connect();
	        break;
	      case 'RESPONSE':
	        break;
	      case 'MESSAGE':
	        parseMessage(message.data);
	        break;
	      default:
	        console.log('Unknown message type received in pubsub.');
	        console.log(message);
	        break;
	    }
	  }

	  // data is message.data, so it should have msg.topic and msg.message
	  function parseMessage(data) {
	    switch (data.topic) {
	      // https://dev.twitch.tv/docs/PubSub/bits/
	      case 'channel-bitsevents.' + state.id:
	        const username = data.message.user_name;
	        const note = data.message.chat_message;
	        const bits = data.message.bits_used;
	        const totalBits = data.message.total_bits_used;
	        _event('bits', {username, note, bits, totalBits});
	        break;
	      // https://discuss.dev.twitch.tv/t/in-line-broadcaster-chat-mod-logs/7281/12
	      case 'chat_moderator_actions.' + state.id + '.' + state.id:
	        const action = data.message.moderation_action;
	        const username = data.message.created_by;
	        const args = data.message.args;
	        _event('moderation', {username, action, args});
	        break;
	      default:
	        break;
	    }
	  }
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

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


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function (TAPIC, state, _ws, _event) {
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
	    _ws.send('PRIVMSG #' + state.channel + ' :' + message);
	    _event('echoChat', message);
	  };
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function (TAPIC, _ws, _event) {
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
	};


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function (TAPIC, _getJSON) {
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
	    const url = 'https://api.twitch.tv/kraken/users/' + user + '/follows/channels/' + channel;
	    _getJSON(
	      url,
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
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function (TAPIC, state, _getJSON) {
	  /**
	  * Checks if "user" is subscribed to the current channel. This is an asynchronous function and requires a callback. Requires the channel_check_subscription permission and the username and channel must be the same.
	  * @param  {string} user     The user name to check.
	  * @param  {function} callback The function that's called when the check is complete. Callback is given an object with isSubscribing (boolean) and dateSubscribed (string).
	  * @function isSubscribing
	  */
	  TAPIC.isSubscribing = function (user, callback) {
	    if (typeof user != 'string' || typeof callback != 'function') {
	      console.error('Invalid parameters. Usage: TAPIC.isSubscribing(user, callback);');
	      return;
	    }
	    // https://api.twitch.tv/kraken/channels/teststate.channel/subscriptions/testuser
	    const url = 'https://api.twitch.tv/kraken/channels/' + state.channel + '/subscriptions/' + user;
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
	            dateSubscribed: (new Date(res.created_at).toLocaleString())
	          });
	        }
	      }
	    );
	  };

	};


/***/ },
/* 18 */
/***/ function(module, exports) {

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


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (TAPIC, state) {
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
	    if (!state.channel) return console.error('Not in a channel.');
	    if (!state.partner) return console.error('Not a partner, cannot run a commercial.');

	    const host = 'https://api.twitch.tv';
	    const path = '/kraken/channels/' + state.channel + '/commercial?oauth_token=' + state.oauth;
	    const url = host + path;

	    if (__webpack_require__(2)) {
	      let options = {
	        host: host,
	        path: path,
	        method: 'POST',
	        headers: {
	          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	          'Client-ID': state.clientid
	        }
	      };
	      let http = __webpack_require__(6);
	      http.request(options).write('length=' + length).end();
	    } else {
	      let xhr = new XMLHttpRequest();
	      xhr.open('POST', url, true);
	      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	      xhr.setRequestHeader('Client-ID', state.clientid);
	      xhr.send('length=' + length);
	    }
	  };
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

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

	    const host = 'https://api.twitch.tv';
	    let path = '/kraken/channels/' + state.channel;
	        path += '?channel[status]=' + encodeURIComponent(status);
	        path += '&channel[game]=' + encodeURIComponent(game);
	        path += '&_method=put&oauth_token=' + state.oauth;

	    if (__webpack_require__(2)) {
	      let options = {
	        host: host,
	        path: path,
	        headers: {
	          'Client-ID': state.clientid
	        }
	      };
	      let http = __webpack_require__(6);
	      http.get(options, function (res) {
	        let output = '';
	        res.setEncoding('utf8');
	        res.on('data', function (chunk) {
	          output += chunk;
	        });
	        res.on('end', function () {
	          if (res.statusCode >= 200 && res.statusCode < 400) {
	            const resp = JSON.parse(output);
	            state.game = resp.game;
	            state.status = resp.status;
	          } else { // error
	            console.error(output);
	          }
	        });
	      }).on('error', function (e) {
	        console.error(e.message);
	      });
	    } else { // vanilla JS
	      let xhr = new XMLHttpRequest();
	      xhr.open('GET', host + path, true);
	      xhr.setRequestHeader('Client-ID', state.clientid);
	      xhr.onload = function () {
	        if (xhr.status >= 200 && xhr.status < 400) {
	          const resp = JSON.parse(xhr.responseText);
	          state.game = resp.game;
	          state.status = resp.status;
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
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

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
	* This is sent when the app state has been updated with the latest Twitch API data. That doesn't necessarilly mean the data is different, only that it's the most recent data.
	* @event update
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
	* Twitch Prime subscription notification.
	* @event subPrime
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


/***/ }
/******/ ]);