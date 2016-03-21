// Twitch Websockets & API in javascript - TWAPI.js
// Made by skhmt, 2016

// compile at: http://closure-compiler.appspot.com/


(function( window ) {
	function define_TWAPI() {

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

		TWAPI.setup = function( clientid, oauth, callback ) {
			if ( !clientid || !oauth ) {
				console.error( 'Invalid parameters. Usage: TWAPI.setup(clientid, oauth, callback);' );
			}
			_clientid = clientid;
			_oauth = oauth;

			JSONP(
				'https://api.twitch.tv/kraken?client_id=' + _clientid + '&oauth_token=' + _oauth + '&api_version=3',
				function( res ) {
					_username = res.token.user_name;
					callback(_username);
				}
			);

		}

		TWAPI.runChat = function( channel, callback ) {
			if ( !_username || !_oauth ) {
				console.error( 'TWAPI not set up, cannot run chat.' );
			}

			_channel = channel.toLowerCase();
			_chatters = {};
			_followers = [];

			JSONP(
				'https://api.twitch.tv/api/channels/' + _channel + '/chat_properties?api_version=3',
				function( res ) {
					var server = res.web_socket_servers[ Math.floor( Math.random() * res.web_socket_servers.length ) ];
					server = 'ws://' + server;
					_ws = new WebSocket( server );
					_ws.onopen = function (event) {
						_ws.send( 'CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership' );
						_ws.send( 'PASS oauth:' + _oauth );
						_ws.send( 'NICK ' + _username );
						_ws.send( 'JOIN #' + _channel );
					}
					// show raw data
					_ws.onmessage = function( event ) {
						var messages = event.data.split( '\r\n' );
						for ( var i = 0; i < messages.length; i++ ) {
							var msg = messages[i]
							if ( msg === 'PING :tmi.twitch.tv' ) {
								_ws.send( 'PONG :tmi.twitch.tv' );
								console.log( 'PONG' );
							}
							else {
								_parseMessage( msg );
							}
						}
					};

					_pingAPI();
					_getSubBadgeUrl();
					callback( _channel );
				} // function()
			);  // $.getJSON(
		}

		TWAPI.closeChat = function() {
			if (!_ws) {
				return console.error( 'Chat is not open.' );
			}
			_ws.close();
			console.log( 'Chat closed.' );
		}

		TWAPI.sendChat = function( msg ) {
			if (!_ws) {
				return console.error( 'Chat is not open.' );
			}
			_ws.send( 'PRIVMSG #' + _channel + ' :' + msg );
		}

		TWAPI.getUsername = function() {
			return _username;
		}

		TWAPI.getChannel = function() {
			return _channel;
		}

		TWAPI.isOnline = function( callback ) {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _online;
		}

		TWAPI.getStatus = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _status;
		}

		TWAPI.getGame = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _game;
		}

		TWAPI.getFollowerCount = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _followerCount;
		}

		TWAPI.getTotalViewCount = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _totalViewCount;
		}

		TWAPI.isPartner = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _partner;
		}

		TWAPI.getCurrentViewCount = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _currentViewCount;
		}

		TWAPI.getFps = function() {
			if ( !_online ) return console.error( 'Stream not online.' );
			return _fps;
		}

		TWAPI.getVideoHeight = function() {
			if ( !_online ) return console.error( 'Stream not online.' );
			return _videoHeight;
		}

		TWAPI.getDelay = function() {
			if ( !_online ) return console.error( 'Stream not online.' );
			return _delay;
		}

		TWAPI.getSubBadgeUrl = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _subBadgeUrl;
		}

		TWAPI.getChatters = function() {
			if ( !_channel ) return console.error( 'Not in a channel.' );
			return _chatters;
		}

		TWAPI.isFollowing = function( user, channel, callback ) {
			// https://api.twitch.tv/kraken/users/skhmt/follows/channels/food
			JSONP(
				'https://api.twitch.tv/kraken/users/' + user + '/follows/channels/' + channel + '?api_version=3',
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
		}

		TWAPI.runCommercial = function( length ) {
			if ( !_partner ) console.error( 'Not a partner, cannot run a commercial.' );
			if ( !_channel ) console.error( 'Not in a channel.' );

			if ( !length ) length = 30;

			var url = 'https://api.twitch.tv/kraken/channels/' + _channel + '/commercial';
			url += '?oauth_token=' + _oauth;

			var req = new XMLHttpRequest();
			req.open('POST', url, true);
			req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			req.send( 'length=' + length );
		}

		TWAPI.setStatusGame = function( status, game ) {
			if ( !status ) status = _status;
			if ( !game ) game = _game;

			var url = 'https://api.twitch.tv/kraken/channels/' + _channel;
			url += '?channel[status]=' + encodeURIComponent(status);
			url += '&channel[game]=' + encodeURIComponent(game);
			url += '&_method=put&oauth_token=' + _oauth;

			var req = new XMLHttpRequest();

			req.open('GET', url, true);

			req.onload = function() {
			  if ( req.status >= 200 && req.status < 400 ) {
			    // Success!
			    var resp = JSON.parse( req.responseText );
				_game = resp.game;
				_status = resp.status;
			  } else {
			    // We reached our target server, but it returned an error
				console.error( req.responseText );
			  }
			};

			req.onerror = function() {
			  // There was a connection error of some sort
			  console.error( req.responseText );
			};

			req.send();
		}

		// private functions below

		function _parseMessage( text ) {
			EV( 'twapiRaw', text);
			var textarray = text.split(' ');

			if ( textarray[2] === 'PRIVMSG' ) { // regular message
				var command = textarray[0];
				textarray.splice( 0, 1 );
				_msgPriv( command, textarray );
			}

			else if ( textarray[1] === 'PRIVMSG' ) { // host notification
				EV( 'twapiHost', textarray[3].substring(1) );
			}

			else if ( textarray[2] === 'NOTICE' ) {
				textarray.splice( 0, 4 );
				var output = textarray.join(' ').substring(1);
				EV( 'twapiNotice', output );
			}

			else if ( textarray[1] === 'JOIN' ) {
				var joinname = textarray[0].split('!')[0].substring(1);
				EV( 'twapiJoin', joinname );
			}

			else if ( textarray[1] === 'PART' ) {
				// :mudb3rt!mudb3rt@mudb3rt.tmi.twitch.tv PART #ultra
				var partname = textarray[0].split('!')[0].substring(1);
				EV( 'twapiPart', partname );
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
				EV( 'twapiRoomstate', {
					"lang": lang,
					"r9k": r9k,
					"slow": slow,
					"subs_only": subs_only
				} );
			}

			else if ( textarray[1] === 'CLEARCHAT' ) {
				var clearname = textarray[3].substring(1);
				EV( 'twapiClear', clearname );
			}

			else {
				// if ( text ) console.info( text );
			}
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
						var tempArgs = args[0].split( '!' );
						from = tempArgs[0];
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
					EV( 'twapiSub', notifyText[0] );
				}
				else if ( notifyText[1] === 'subscribed' ) { // "[name] subscribed for 13 months in a row!"
					EV( 'twapiSubMonths', {
						"name": notifyText[0],
						"months": notifyText[3]
					} );
				}
				else { // "[number] viewers resubscribed while you were away!"
					EV( 'twapiSubsAway', notifyText[0] );
				}
			}
			else {
				EV( 'twapiMsg',  {
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
				'https://api.twitch.tv/kraken/streams/' + _channel + '?api_version=3',
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
				}
			);

			JSONP(
				'https://api.twitch.tv/kraken/channels/' + _channel + '/follows?client_id=' + _clientid + '&api_version=3&limit=100',
				function( res ) {
					// Do something about updating recent followers
					// https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows
					if ( !res.follows ) return;

					var firstUpdate = true;
					if ( _followers.length > 0 ) firstUpdate = false;

					for ( var i = 0; i < res.follows.length; i++ ) {
						var tempFollower = res.follows[i].user.display_name;
						if ( _followers.indexOf( tempFollower ) === -1 ) { // if user isn't in _followers
							if ( !firstUpdate ) EV( 'twapiFollow', tempFollower ); // if it's not the first update, post new follower
							_followers.push( tempFollower ); // add the user to the follower list
						}
		            }
				}
			);

			JSONP(
				'https://tmi.twitch.tv/group/user/' + _channel + '/chatters?client_id=' + _clientid + '&api_version=3',
				function( res ) {
					if ( !res.data.chatters ) {
						return console.log( 'No response for user list.' );
					}
					_currentViewCount = res.data.chatter_count;
					// .slice(); is to set by value rather than reference
					_chatters.moderators = res.data.chatters.moderators.slice();
					_chatters.staff = res.data.chatters.staff.slice();
					_chatters.admins = res.data.chatters.admins.slice();
					_chatters.global_mods = res.data.chatters.global_mods.slice();
					_chatters.viewers = res.data.chatters.viewers.slice();
				}
			);

			setTimeout( function() {
				_pingAPI();
			}, 60*1000 );
		}

		function _getSubBadgeUrl() {
			JSONP(
				'https://api.twitch.tv/kraken/chat/' + _channel + '/badges?api_version=3',
				function( res ) {
					if ( res.subscriber != null ) {
						_subBadgeUrl = res.subscriber.image;
					}
				}
			);
		}

		return TWAPI;
	}


	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////


	// Checking if TWAPI is used as a variable
	if( typeof(TWAPI) === 'undefined' ) {
		window.TWAPI = define_TWAPI();
	}
	else {
		console.error( 'TWAPI already defined.' );
	}

	// Utilities

	function EV( eventName, eventDetail ) {
		var msgEvent = new CustomEvent( eventName, {
			"detail" : eventDetail
		} );
		document.dispatchEvent( msgEvent );
	}

	function QSA( selector ) {
		return document.querySelectorAll(selector);
	}

	function JSONP( url, callback ) {
		// Keep trying to make a random callback name until it finds a unique one.
		var randomCallback;
		do {
			randomCallback = 'jsonp' + Math.floor( Math.random() * 1000000 );
		} while ( window[randomCallback] );

		window[randomCallback] = function(json) {
			callback( json );
			delete window[randomCallback]; // Cleanup the window object
		}

		var node = document.createElement('script');
		node.src = url + '&callback=' + randomCallback;
		QSA('head')[0].appendChild(node);
	}

} )( window );
