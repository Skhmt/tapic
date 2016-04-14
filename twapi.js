// Twitch Websockets & API in javascript - TWAPI.js
// Version 2.0
// Made by skhmt, 2016

// compile/minify at: https://closure-compiler.appspot.com/


(function() {
	function define_TWAPI() {

		var _refreshRate = 10; // check the Twitch API every [this many] seconds

		var TWAPI = {}; // this is the return object
		var _clientid = '';
		var _oauth = '';
		var _username = '';
		var _channel = '';
		var _ws;
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
		var _isNode = false;
		var _events = new Map();

		if ( typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
			_isNode = true;
			console.info('TWAPI is running in Node.js.');
		}

		TWAPI.setup = function( clientid, oauth, callback ) {
			if ( !clientid || !oauth ) {
				console.error( 'Invalid parameters. Usage: TWAPI.setup(clientid, oauth, callback);' );
			}
			_clientid = clientid;
			_oauth = oauth;

			if ( !_isNode ) { // node.js doesn't have a DOM
				var node = document.createElement( 'div' );
				node.id = 'twapiJsonpContainer';
				node.style.cssText = 'display:none;';
				document.getElementsByTagName( 'body' )[0].appendChild(node);
			}

			JSONP(
				'https://api.twitch.tv/kraken?client_id=' + _clientid + '&oauth_token=' + _oauth + '&api_version=3',
				function( res ) {
					_username = res.token.user_name;
					if ( callback ) {
						callback(_username);
					}
				}
			);
		};

		TWAPI.runChat = function( channel, callback ) {
			if ( !_username || !_oauth ) {
				console.error( 'TWAPI not set up, cannot run chat.' );
			}

			if ( _ws ) {
				TWAPI.closeChat();
			}

			_channel = channel.toLowerCase();

			if ( _isNode ) {
				var WS = require( 'ws' );
				_ws = new WS( 'ws://irc-ws.chat.twitch.tv:80' );
			}
			else {
				_ws = new WebSocket( 'ws://irc-ws.chat.twitch.tv:80' );
			}
			function wsOpen() {
				_ws.send( 'CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership' );
				_ws.send( 'PASS oauth:' + _oauth );
				_ws.send( 'NICK ' + _username );
				_ws.send( 'JOIN #' + _channel );
			}
			function wsMessage( event ) {
				var messages;
				if ( _isNode ) {
					messages = event.split( '\r\n' );
				}
				else {
					messages = event.data.split( '\r\n' );
				}

				for ( var i = 0; i < messages.length; i++ ) {
					var msg = messages[i];
					if ( msg === 'PING :tmi.twitch.tv' ) {
						_ws.send( 'PONG :tmi.twitch.tv' );
					}
					else if ( msg ) {
						_parseMessage( msg );
					}
				}
			}
			if ( _isNode ) {
				_ws.on('open', wsOpen);
				_ws.on('message', wsMessage);
			}
			else {
				_ws.onopen = wsOpen;
				_ws.onmessage = wsMessage;
			}

			_getSubBadgeUrl(function() {
				_pingAPI();
				if ( callback ) {
					setTimeout(callback, 500);
				}
			});
		}; // runChat()

		TWAPI.closeChat = function() {
			if (!_ws) {
				return console.error( 'Chat is not open.' );
			}
			_ws.close();

			console.log( 'Chat closed.' );
			_channel = '';
			_ws = '';
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
		};

		TWAPI.changeChannel = function( channel ) {
			if (!_ws) {
				return console.error( 'Chat is not open.' );
			}
			_ws.send( 'PART #' + _channel );

			_channel = channel;
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

			_ws.send( 'JOIN #' + _channel );
		};

		TWAPI.sendChat = function( msg ) {
			if (!_ws) {
				return console.error( 'Chat is not open.' );
			}
			_ws.send( 'PRIVMSG #' + _channel + ' :' + msg );
		};

		TWAPI.sendWhisper = function( user, msg ) {
			if (!_ws) {
				return console.error( 'Chat is not open.' );
			}
			_ws.send( 'PRIVMSG #jtv :/w ' + user + ' ' + msg );
		};

		TWAPI.getUsername = function() {
			return _username;
		};

		TWAPI.getChannel = function() {
			return _channel;
		};

		TWAPI.isOnline = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _online;
		};

		TWAPI.getStatus = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _status;
		};

		TWAPI.getGame = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _game;
		};

		TWAPI.getFollowerCount = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _followerCount;
		};

		TWAPI.getTotalViewCount = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _totalViewCount;
		};

		TWAPI.isPartner = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _partner;
		};

		TWAPI.getCurrentViewCount = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _currentViewCount;
		};

		TWAPI.getFps = function() {
			if ( !_online ) return console.error( 'Stream not online.' );
			return _fps;
		};

		TWAPI.getVideoHeight = function() {
			if ( !_online ) return console.error( 'Stream not online.' );
			return _videoHeight;
		};

		TWAPI.getDelay = function() {
			if ( !_online ) return console.error( 'Stream not online.' );
			return _delay;
		};

		TWAPI.getSubBadgeUrl = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _subBadgeUrl;
		};

		TWAPI.getChatters = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _chatters;
		};

		TWAPI.getCreatedAt = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _createdAt;
		};

		TWAPI.getLogo = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _logo;
		};

		TWAPI.getVideoBanner = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _videoBanner;
		};

		TWAPI.getProfileBanner = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _profileBanner;
		};

		TWAPI.isFollowing = function( user, channel, callback ) {
			// https://api.twitch.tv/kraken/users/skhmt/follows/channels/food
			JSONP(
				'https://api.twitch.tv/kraken/users/' + user + '/follows/channels/' + channel + '?api_version=3&client_id=' + _clientid,
				function( res ) {
					if ( res.error ) callback( {
						"isFollowing": false
					} );
					else callback( {
						"isFollowing": true,
						"dateFollowed": ( new Date(res.created_at).toLocaleString() )
					} );
				}
			);
		};

		TWAPI.isSubscribing = function( user, channel, callback ) {
			// https://api.twitch.tv/kraken/channels/test_channel/subscriptions/testuser
			JSONP(
				'https://api.twitch.tv/kraken/channels/' + channel + '/subscriptions/' + user + '?api_version=3client_id=' + _clientid,
				function( res ) {
					if ( res.error ) callback( {
						"isSubscribing": false
					} );
					else callback( {
						"isSubscribing": true,
						"dateSubscribed": ( new Date(res.created_at).toLocaleString() )
					} );
				}
			);
		};

		TWAPI.runCommercial = function( length ) {
			if ( !_partner ) console.error( 'Not a partner, cannot run a commercial.' );
			if ( !_channel ) console.error( 'Not in a channel.' );

			if ( !length ) length = 30;

			var host = 'https://api.twitch.tv';
			var path = '/kraken/channels/' + _channel + '/commercial?oauth_token=' + _oauth;
			var url = host + path;

			if ( _isNode ) {
				var options = {
					host: host,
					path: path,
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				}
				var http = require( 'https' );
				http.request(options).write( 'length=' + length ).end();
			}
			else {
				var xhr = new XMLHttpRequest();
				xhr.open('POST', url, true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				xhr.send( 'length=' + length );
			}
		};

		TWAPI.setStatusGame = function( status, game ) {
			if ( !status ) status = _status;
			if ( !game ) game = _game;

			var url = 'https://api.twitch.tv/kraken/channels/' + _channel;
			url += '?channel[status]=' + encodeURIComponent(status);
			url += '&channel[game]=' + encodeURIComponent(game);
			url += '&_method=put&oauth_token=' + _oauth;

			if ( _isNode ) { // Node
				var http = require( 'https' );
				http.get( url, function( res ) {
					var output = '';
					res.setEncoding( 'utf8' );
					res.on( 'data', function( chunk ) {
						output += chunk;
					} );
					res.on( 'end', function() {
						if ( res.statusCode >= 200 && res.statusCode < 400 ) {
							var resp = JSON.parse( output );
							_game = resp.game;
							_status = resp.status;
						}
						else { // error
							console.error( output );
						}
					} );
				} ).on( 'error', function( e ) {
					console.error( e.message );
				} );
			}
			else { // vanilla JS
				var xhr = new XMLHttpRequest();
				xhr.open( 'GET', url, true );
				xhr.onload = function() {
					if ( xhr.status >= 200 && xhr.status < 400 ) {
					    var resp = JSON.parse( xhr.responseText );
						_game = resp.game;
						_status = resp.status;
					} else {
					    // We reached our target server, but it returned an error
						console.error( xhr.responseText );
					}
				};
				xhr.onerror = function() {
				  // There was a connection error of some sort
				  console.error( xhr.responseText );
				};
				xhr.send();
			}
		};

		// Private functions

		function _parseMessage( text ) {
			EV( 'raw', text );
			var textarray = text.split(' ');

			if ( textarray[2] === 'PRIVMSG' ) { // regular message
				var command = textarray[0];
				textarray.splice( 0, 1 );
				_msgPriv( command, textarray );
			}

			else if ( textarray[1] === 'PRIVMSG' ) { // host notification
				EV( 'host', textarray[3].substring(1) );
			}

			else if ( textarray[2] === 'NOTICE' ) {
				textarray.splice( 0, 4 );
				var output = textarray.join(' ').substring(1);
				EV( 'notice', output );
			}

			else if ( textarray[1] === 'JOIN' ) {
				var joinname = textarray[0].split('!')[0].substring(1);
				EV( 'join', joinname );
			}

			else if ( textarray[1] === 'PART' ) {
				// :mudb3rt!mudb3rt@mudb3rt.tmi.twitch.tv PART #ultra
				var partname = textarray[0].split('!')[0].substring(1);
				EV( 'part', partname );
			}

			else if ( textarray[2] === 'ROOMSTATE' ) {
				// @broadcaster-lang=;r9k=0;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #ultra
				var statearray = textarray[0].substring(1).split(';');
				var lang, r9k, slow, subs_only;
				for (var i in statearray) {
					var stateparam = i.split('=');
					if ( stateparam[0] === 'broadcaster-lang' ) lang = stateparam[1];
					else if ( stateparam[0] === 'r9k' ) r9k = stateparam[1];
					else if ( stateparam[0] === 'slow' ) slow = stateparam[1];
					else if ( stateparam[0] === 'subs-only' ) subs_only = stateparam[1];
				}
				EV( 'roomstate', {
					"lang": lang,
					"r9k": r9k,
					"slow": slow,
					"subs_only": subs_only
				} );
			}

			else if ( textarray[2] === 'WHISPER' ) {
				_msgWhisper( textarray );
			}

			else if ( textarray[1] === 'CLEARCHAT' ) {
				if ( textarray.length === 4 ) {
					var clearname = textarray[3].substring(1);
					EV( 'clearUser', clearname );
				}
				else {
					EV( 'clearChat');
				}
			}

			else {
				// if ( text ) console.info( text );
			}
		}

		function _msgWhisper( textarray ) {
			var color = '#d2691e';
			var emotes = '';
			var turbo = false;
			var from = '';
			var message_id = '';
			var thread_id = '';
			var user_id = '';
			var commands = textarray[0].split(';');

			for ( var i = 0; i < commands.length; i++ ) {
				commands[i] = commands[i].split( '=' );
				var tempParamName = commands[i][0];
				var tempParamValue = commands[i][1];
				if ( tempParamName === 'display-name' ) {
					if (tempParamValue === '') { // some people don't have a display-name, so getting it from somewhere else as a backup
						from = textarray[1].split('!')[0].substring(1);
					} else {
						from = tempParamValue;
					}
				}
				else if ( tempParamName === '@color' && tempParamValue != '' ) {
					color = tempParamValue;
				}
				else if ( tempParamName === 'turbo' && tempParamValue == '1' ) {
					turbo = true;
				}
				else if ( tempParamName === 'emotes' && tempParamValue != '' ) {
					emotes = tempParamValue;
				}
				else if ( tempParamName === 'message-id' && tempParamValue != '' ) {
					message_id = tempParamValue;
				}
				else if ( tempParamName === 'thread-id' && tempParamValue != '' ) {
					thread_id = tempParamValue;
				}
				else if ( tempParamName === 'user-id' && tempParamValue != '' ) {
					user_id = tempParamValue;
				}
			}

			var joinedText = textarray.slice(4).join(' ').substring(1);

			EV( 'whisper', {
				"from": from,
				"to": textarray[3],
				"color": color,
				"emotes": emotes,
				"turbo": turbo,
				"message_id": message_id,
				"thread_id": thread_id,
				"user_id": user_id,
				"text": joinedText
			} );
		}

		function _msgPriv( command, args ) {
			var commands = command.split( ';' );
			var color = '#d2691e';
			var mod = false;
			var subscriber = false;
			var turbo = false;
			var from = '';
			var emotes = '';
			for ( var i = 0; i < commands.length; i++ ) {
				commands[i] = commands[i].split( '=' );
				var tempParamName = commands[i][0];
				var tempParamValue = commands[i][1];
				if ( tempParamName === 'display-name' ) {
					if (tempParamValue === '') { // some people don't have a display-name, so getting it from somewhere else as a backup
						from = args[0].split( '!' )[0].substring(1);
					} else {
						from = tempParamValue;
					}
				}
				else if ( tempParamName === '@color' && tempParamValue != '' ) {
					color = tempParamValue;
				}
				else if ( tempParamName === 'mod' && tempParamValue == '1' ) {
					mod = true;
				}
				else if ( tempParamName === 'subscriber' && tempParamValue == '1' ) {
					subscriber = true;
				}
				else if ( tempParamName === 'turbo' && tempParamValue == '1' ) {
					turbo = true;
				}
				else if ( tempParamName === 'emotes' && tempParamValue != '' ) {
					emotes = tempParamValue;
				}
			}

			var action = false;
			var text = args[3].substring(1); // first word, removed the colon
			args.splice(0,4);
			var lessargs = args.join(' '); // all other words
			 // ACTION:
				// Command: @color=#1E90FF;display-name=Skhmt;emotes=;subscriber=0;turbo=0;user-id=71619374;user-type=
				// Args 0: skhmt!skhmt@skhmt.tmi.twitch.tv PRIVMSG #skhmt :ACTION does things
			if ( text === '\001ACTION' ) {
				text = lessargs; // text is now all words after "ACTION"
				action = true;
			}
			else { // not an action
				text += ' ' + lessargs; // text is merged with lessargs to make up the entire text string
			}
			var output = text.replace(/</g,'&lt;').replace(/>/g,'&gt;');

			if ( 'from' === 'twitchnotify' ) { // Sub notification
				var notifyText = text.split(' ');
				if ( notifyText[1] === 'just' ) { // "[name] just subscribed!"
					EV( 'sub', notifyText[0] );
				}
				else if ( notifyText[1] === 'subscribed' ) { // "[name] subscribed for 13 months in a row!"
					EV( 'subMonths', {
						"name": notifyText[0],
						"months": notifyText[3]
					} );
				}
				else { // "[number] viewers resubscribed while you were away!"
					EV( 'subsAway', notifyText[0] );
				}
			}
			else {
				EV( 'message',  {
					"from": from,
					"color": color,
					"mod": mod,
					"sub": subscriber,
					"turbo": turbo,
					"streamer": ( from.toLowerCase() === _channel.toLowerCase() ),
					"action": action,
					"text": output,
					"emotes": emotes
				} );
			}
		}

		function _pingAPI() {
			JSONP(
				'https://api.twitch.tv/kraken/streams/' + _channel + '?client_id=' + _clientid + '&api_version=3',
				function( res ) {
					if ( res.stream ) {
						_online = true;
						_currentViewCount = res.stream.viewers;
						_fps = res.stream.average_fps;
						_videoHeight = res.stream.video_height;
						_delay = res.stream.delay;
					}
					else {
						_online = false;
					}
				}
			);

			JSONP(
				'https://api.twitch.tv/kraken/channels/' + _channel + '?client_id=' + _clientid + '&api_version=3',
				function( res ) {
					_game = res.game;
					_status = res.status;
					_followerCount = res.followers;
					_totalViewCount = res.views;
					_partner = res.partner;
					_createdAt = res.created_at;
					_logo = res.logo;
					_videoBanner = res.video_banner; // offline banner
					_profileBanner = res.profile_banner;
				}
			);

			JSONP(
				'https://api.twitch.tv/kraken/channels/' + _channel + '/follows?client_id=' + _clientid + '&api_version=3&limit=100',
				function( res ) {
					// https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows
					if ( !res.follows ) return;

					var firstUpdate = true;
					if ( _followers.length > 0 ) firstUpdate = false;

					for ( var i = 0; i < res.follows.length; i++ ) {
						var tempFollower = res.follows[i].user.display_name;
						if ( _followers.indexOf( tempFollower ) === -1 ) { // if user isn't in _followers
							if ( !firstUpdate ) {
								EV( 'follow', tempFollower ); // if it's not the first update, post new follower
							}
							_followers.push( tempFollower ); // add the user to the follower list
						}
		            }
				}
			);

			JSONP(
				'https://tmi.twitch.tv/group/user/' + _channel + '/chatters?client_id=' + _clientid + '&api_version=3',
				function( res ) {
					if ( !_isNode ) { // using JSONP with this API endpoint adds "data" to the object
						res = res.data;
					}

					if ( !res.chatters ) {
						return console.log( 'No response for user list.' );
					}
					_currentViewCount = res.chatter_count;
					// .slice(); is to set by value rather than reference
					_chatters.moderators = res.chatters.moderators.slice();
					_chatters.staff = res.chatters.staff.slice();
					_chatters.admins = res.chatters.admins.slice();
					_chatters.global_mods = res.chatters.global_mods.slice();
					_chatters.viewers = res.chatters.viewers.slice();
				}
			);

			setTimeout( function() {
				if ( !_isNode ) {
					document.querySelector( '#twapiJsonpContainer' ).innerHTML = '';
				}
				_pingAPI();
			}, _refreshRate * 1000 );
		}

		function _getSubBadgeUrl( callback ) {
			JSONP(
				'https://api.twitch.tv/kraken/chat/' + _channel + '/badges?api_version=3',
				function( res ) {
					if ( res.subscriber != null ) {
						_subBadgeUrl = res.subscriber.image;
					}
					if ( callback ) {
						callback();
					}
				}
			);
		}

		TWAPI.listen = function( eventName, callback ) {
			if ( _events.has( eventName ) ) { // if there are listeners for eventName
				var value = _events.get( eventName ); // get the current array of callbacks
				value.push( callback ); // add the new callback
				_events.set( eventName, value ); // replace the old callback array
			}
			else { // if eventName has no listeners
				_events.set( eventName, [callback] );
			}
		};

		function EV( eventName, eventDetail ) {
			if ( _events.has( eventName ) ) {
				var callbacks = _events.get( eventName ); // gets an array of callback functions
				for ( var i in callbacks ) {
					callbacks[i]( eventDetail ); // runs each and sends them eventDetail as the parameter
				}
			}
		}

		function JSONP( url, callback ) {
			if ( _isNode ) { // No JSONP required, so using http.get
				var http = require( 'https' );
				http.get( url, function(res) {
					var output = '';
					res.setEncoding( 'utf8' );
					res.on( 'data', function(chunk) {
						output += chunk;
					} );
					res.on( 'end', function() {
						if ( res.statusCode >= 200 && res.statusCode < 400 ) {
							callback( JSON.parse( output ) );
						}
						else { // error
							console.error( output );
						}
					} );
				} ).on( 'error', function( e ) {
					console.error( e.message );
				} );
			}
			else {
				// Keep trying to make a random callback name until it finds a unique one.
				var randomCallback;
				do {
					randomCallback = 'jsonp' + Math.floor( Math.random() * 1000000 );
				} while ( window[randomCallback] );

				window[randomCallback] = function( json ) {
					callback( json );
					delete window[randomCallback]; // Cleanup the window object
				}

				var node = document.createElement( 'script' );
				node.src = url + '&callback=' + randomCallback;
				document.querySelector( '#twapiJsonpContainer' ).appendChild(node);
			}
		}

		return TWAPI;
	}


	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////


	if ( typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) { // node.js
		module.exports = define_TWAPI();
	}
	else if ( typeof define === 'function' && define.amd ) { // require.js
		define([], function() {
			return define_TWAPI();
		});
	}
	else { // regular js
		if ( typeof(TWAPI) === 'undefined' ) {
			window.TWAPI = define_TWAPI();
		}
		else {
			console.error( 'TWAPI already defined.' );
		}
	}

} )();
