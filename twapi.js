// Twitch Websockets & API - TWAPI
// Made by skhmt, 2016

(function( window ) {
	function define_TWAPI() {

		var TWAPI = {}; // this is the return object
		var _clientid = '';
		var _oauth = '';
		var _username = '';
		var _channel = '';
		var _ws;

		TWAPI.getUsername = function() {
			return _username;
		}

		TWAPI.getChannel = function() {
			return _channel;
		}

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

		TWAPI.runChat = function( channel ) {
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
								EV( 'rawChatMessage', msg );
							}
						}
					};
				} // function()
			);  // $.getJSON(
		}

		TWAPI.closeChat = function() {
			if (_ws) {
				_ws.close();
				console.log( 'Chat closed.' );
			}
			else {
				console.error( 'Chat is not open.' );
			}
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
		}

		var node = document.createElement('script');
		node.src = url + '&callback=' + randomCallback;
		document.body.appendChild(node);
	}

} )( window );
