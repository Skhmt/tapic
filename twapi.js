// Twitch Websockets & API in javascript - TWAPI.js
// Made by skhmt, 2016

// compile at: http://closure-compiler.appspot.com/

// follows & list of current viewers
// emoticon processing


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
		var _followers = '';
		var _views = '';
		var _partner = '';
		var _currentViewers = '';
		var _fps = '';
		var _videoHeight = '';
		var _delay = '';
		var _subBadgeUrl = '';

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

			_channel = channel;

			JSONP(
				'https://api.twitch.tv/api/channels/' + channel + '/chat_properties?api_version=3',
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
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _online;
		}

		TWAPI.getStatus = function() {
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _status;
		}

		TWAPI.getGame = function() {
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _game;
		}

		TWAPI.getFollowers = function() {
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _followers;
		}

		TWAPI.getViews = function() {
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _views;
		}

		TWAPI.isPartner = function() {
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _partner;
		}

		TWAPI.getCurrentViewers = function() {
			if ( !_online ) console.error( 'Stream not online.' );
			return _currentViewers;
		}

		TWAPI.getFps = function() {
			if ( !_online ) console.error( 'Stream not online.' );
			return _fps;
		}

		TWAPI.getVideoHeight = function() {
			if ( !_online ) console.error( 'Stream not online.' );
			return _videoHeight;
		}

		TWAPI.getDelay = function() {
			if ( !_online ) console.error( 'Stream not online.' );
			return _delay;
		}

		TWAPI.getSubBadgeUrl = function() {
			if ( !_channel ) console.error( 'Not in a channel.' );
			return _subBadgeUrl;
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
			} else if ( textarray[1] === 'JOIN' ) {
				var joinname = textarray[0].split('!')[0].substring(1);
				EV( 'twapiJoin', joinname );
			} else {
				console.log( text );
			}
		}

		function _msgPriv( command, args ) {
			var commands = command.split( ';' );
			var color = '#d2691e';
			var mod = false;
			var subscriber = false;
			var turbo = false;
			var from = '';
			for ( var i = 0; i < commands.length; i++ ) {
				commands[i] = commands[i].split( '=' );
				var tempParamName = commands[i][0];
				var tempParamValue = commands[i][1];
				if (tempParamName == 'display-name') {
					if (tempParamValue === '') { // some people don't have a display-name, so getting it from somewhere else as a backup
						var tempArgs = args[0].split( '!' );
						from = tempArgs[0];
					} else {
						from = tempParamValue;
					}
				}
				else if ( tempParamName == '@color' && tempParamValue != '' ) {
					color = tempParamValue;
				}
				else if ( tempParamName == 'mod' && tempParamValue == '1' ) {
					mod = true;
				}
				else if ( tempParamName == 'subscriber' && tempParamValue == '1' ) {
					subscriber = true;
				}
				else if ( tempParamName == 'turbo' && tempParamValue == '1' ) {
					turbo = true;
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
					"text": output
				} );
			}
		}

		function _pingAPI() {

			JSONP(
				'https://api.twitch.tv/kraken/streams/' + _channel + '?api_version=3',
				function( res ) {
					if ( res.stream ) {
						_online = true;
						_currentViewers = res.stream.viewers;
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
					_followers = res.followers;
					_views = res.views;
					_partner = res.partner;
				}
			);

			JSONP(
				'https://api.twitch.tv/kraken/channels/' + _channel + '/follows?client_id=' + _clientid + '&api_version=3',
				function( res ) {
					// Do something about updating recent followers
					// https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows
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
						subBadgeUrl = res.subscriber.image;
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
