var TWAPI = require('./twapi-toNode.js');
var clientid = ''; // public client id
var oauth = ''; // oauth without "oauth:", requires chat_login, channel_editor
// channel_commercial (if you want to run commercials), channel_check_subscription (if you want to check subscriber status)
// Do this first
TWAPI.setup( clientid, oauth, function( username ) {
	// This is also required for a lot of things to work
	var channel = username;
	TWAPI.runChat( channel, function() {
		// Run test functions after joining a chat
		tests();
	} );
} );
// EventListeners
TWAPI.listen('twapiRaw', function( e ) {
	// You really don't NEED to see raw messages. But you can if you want.
	// You can also manually parse the raw messages if you don't trust TWAPI.js
	// writeChat( '* ' + e );
} );
TWAPI.listen('twapiNotice', function( e ) {
	writeChat( e );
} );
TWAPI.listen('twapiJoin', function( e ) {
	writeChat( e + ' has joined.' );
} );
TWAPI.listen('twapiPart', function( e ) {
	writeChat( e + ' has left the channel.' );
} );
TWAPI.listen('twapiClearUser', function( e ) {
	writeChat( e + ' has been purged/timed out.' );
} );

TWAPI.listen('twapiClearChat', function( e ) {
	writeChat( 'Chat has been cleared.' );
} );
TWAPI.listen('twapiHost', function( e ) {
	writeChat( e + ' is hosting you.' );
} );
TWAPI.listen('twapiFollow', function( e ) {
	writeChat( e + ' has followed you.' );
} );
TWAPI.listen('twapiSub', function( e ) {
	writeChat( e + ' has just subscribed!' );
} );
TWAPI.listen('twapiSubMonths', function( e ) {
	writeChat( e.name + ' has resubbed ' + e.months + ' times!' );
} );
TWAPI.listen('twapiSubsAway', function( e ) {
	writeChat( e + ' users have subbed since you have been offline.' );
} );
TWAPI.listen('twapiRoomstate', function( e ) {
	var output = 'Roomstate options: ';
	if ( e.lang ) output += ' lang:' + e.lang;
	if ( e.r9k ) output += ' r9k';
	if ( e.slow ) output += ' slow';
	if ( e.subs_only ) output += ' subs-only';
	if ( !e.lang && !e.r9k && !e.slow && !e.subs_only ) {
		output += ' none.';
	}
	writeChat( output );
} );
TWAPI.listen('twapiMsg', function( e ) {
	var output = (e.mod ? '<img src="http://chat-badges.s3.amazonaws.com/mod.png">' : '') +
		(e.sub  ?'<img src="' + TWAPI.getSubBadgeUrl() + '">' : '') +
		(e.turbo ? '<img src="http://chat-badges.s3.amazonaws.com/turbo.png">' : '') +
		(e.streamer ? '<img src="http://chat-badges.s3.amazonaws.com/broadcaster.png">' : '') +
		'<strong style="color: ' + e.color + ';">' +
		e.from +
		'</strong>&nbsp;' +
		(e.action ? '<span style="color: ' + e.color + ';">' : ':&nbsp;&nbsp;') +
		e.text +
		(e.action ? '</span>' : '' );
		// e.emotes is the emotes, e.g. '25:0-4,12-16/1902:6-10'
		// https://github.com/justintv/Twitch-API/blob/master/IRC.md#privmsg
	output = e.from + ': ' + e.text;
	writeChat( output );
} );
TWAPI.listen('twapiWhisper', function( e ) {
	var output = (e.turbo ? '<img src="http://chat-badges.s3.amazonaws.com/turbo.png">' : '') +
		'<strong style="color: ' + e.color + ';">' +
		e.from +
		'</strong>' +
		' &gt; ' +
		'<strong>' + e.to + '</strong> : ' +
		e.text;
	output = e.from + ': ' + e.text;
	// e.message_id & e.thread_id & e.user_id contain their respective ids
	// When using whispers for a bot, be sure to whitelist it: https://discuss.dev.twitch.tv/t/are-your-whispers-not-going-through-for-your-bot/5183/3
	writeChat( output );
} );
// Utility functions
function tests() {
	// TWAPI.sendChat( 'Hello world!' );
	// TWAPI.sendWhisper( 'littlecatbot', 'Hello whisper!' );
	// TWAPI.changeChannel( 'letsmakefriends' );
	console.log( 'getUsername: ' + TWAPI.getUsername() );
	console.log( 'getChannel: ' + TWAPI.getChannel() );
	console.log( 'getGame: ' + TWAPI.getGame() );
	console.log( 'getStatus: ' + TWAPI.getStatus() );
	console.log( 'getFollowerCount: ' + TWAPI.getFollowerCount() );
	console.log( 'getTotalViewCount: ' + TWAPI.getTotalViewCount() );
	console.log( 'getCurrentViewCount: ' + TWAPI.getCurrentViewCount() );
	console.log( 'getCreatedAt: ' + TWAPI.getCreatedAt() );
	console.log( 'getLogo: ' + TWAPI.getLogo() );
	console.log( 'getVideoBanner: ' + TWAPI.getVideoBanner() );
	console.log( 'getProfileBanner: ' + TWAPI.getProfileBanner() );
	var folUser = 'skhmt';
	var folTarget = 'letsmakefriends';
	TWAPI.isFollowing( folUser, folTarget, function( res ) {
		if ( res.isFollowing ) console.log( folUser + ' has been following ' + folTarget + ' since: ' + res.dateFollowed );
		else console.log( folUser + ' is not following ' + folTarget + '.' );
	} );
	// // Requires 'channel_check_subscription'
	// var subUser = 'skhmt';
	// var subChannel = 'letsmakefriends';
	// TWAPI.isSubscribing( subUser, subChannel, function( res ) {
	// 	if ( res.isSubscribing ) console.log( subUser + ' has been subbed to ' + subChannel + ' since: ' + res.dateSubscribed );
	// 	else console.log( subUser + ' is not subbed to ' + subChannel + '.' );
	// } );
	console.log( 'isPartner: ' + TWAPI.isPartner() );
	console.log( 'getSubBadgeUrl: ' + TWAPI.getSubBadgeUrl() );
	// TWAPI.runCommercial('30'); // requires 'channel_commercial'
	console.log( 'isOnline: ' + TWAPI.isOnline() );
	console.log( 'getFps: ' + TWAPI.getFps() );
	console.log( 'getVideoHeight: ' + TWAPI.getVideoHeight() );
	console.log( 'getDelay: ' + TWAPI.getDelay() );
	console.log( 'getChatters: ' + JSON.stringify( TWAPI.getChatters() ) );
	// TWAPI.setStatusGame('Making a Twitch Javascript Framework #programming', 'Creative');
	// TWAPI.closeChat();
}
function writeChat(msg) {
	console.log('> ' + msg);
}
