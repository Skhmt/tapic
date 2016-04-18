// See test.html for more complete tests. This is just a simple node.js example

var TWAPI = require('./twapi.js');
var clientid = ''; // public client id
var oauth = ''; // oauth without "oauth:", requires chat_login, channel_editor

TWAPI.setup( clientid, oauth, function( username ) {
	var channel = username;
	TWAPI.runChat( channel, function() {
		tests();
	} );
} );

// EventListeners
TWAPI.listen('notice', function( e ) {
	console.log( '* ' + e );
} );
TWAPI.listen('message', function( e ) {
	console.log( '> ' + e.from + ': ' + e.text );
} );

// Utility functions
function tests() {
	console.log( 'getUsername: ' + TWAPI.getUsername() );
	console.log( 'getChannel: ' + TWAPI.getChannel() );
	console.log( 'getGame: ' + TWAPI.getGame() );
	console.log( 'getStatus: ' + TWAPI.getStatus() );
	console.log( 'getFollowerCount: ' + TWAPI.getFollowerCount() );
	console.log( 'getTotalViewCount: ' + TWAPI.getTotalViewCount() );
	console.log( 'getCurrentViewCount: ' + TWAPI.getCurrentViewCount() );
	console.log( 'isOnline: ' + TWAPI.isOnline() );
	console.log( 'getChatters: ' + JSON.stringify( TWAPI.getChatters() ) );
}
