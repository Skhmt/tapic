// See test.html for more complete examples. This is just a simple node.js example

var TAPIC = require('tapic');
var clientid = ''; // public client id
var oauth = ''; // oauth without "oauth:", requires chat_login, channel_editor

TAPIC.setup( clientid, oauth, function( username ) {
	var channel = username;
	TAPIC.runChat( channel, function() {
		tests();
	} );
} );

// EventListeners
TAPIC.listen('notice', function( e ) {
	console.log( '* ' + e );
} );
TAPIC.listen('message', function( e ) {
	console.log( '> ' + e.from + ': ' + e.text );
} );

// Utility functions
function tests() {
	console.log( 'getUsername: ' + TAPIC.getUsername() );
	console.log( 'getChannel: ' + TAPIC.getChannel() );
	console.log( 'getGame: ' + TAPIC.getGame() );
	console.log( 'getStatus: ' + TAPIC.getStatus() );
	console.log( 'getFollowerCount: ' + TAPIC.getFollowerCount() );
	console.log( 'getTotalViewCount: ' + TAPIC.getTotalViewCount() );
	console.log( 'getCurrentViewCount: ' + TAPIC.getCurrentViewCount() );
	console.log( 'isOnline: ' + TAPIC.isOnline() );
	console.log( 'getChatters: ' + JSON.stringify( TAPIC.getChatters() ) );
}
