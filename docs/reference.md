# TAPIC

Twitch API & Chat in javascript.



* * *

### TAPIC.setup(clientid, oauth, callback) 

Sets the clientid and oauth, then opens a chat connection and starts polling the Twitch API for data. This needs to be done before joining a channel.

**Parameters**

**clientid**: `string`, Your public clientid.

**oauth**: `string`, Your user's oauth token. See: https://github.com/justintv/Twitch-API/blob/master/authentication.md for instructions on how to do that.

**callback**: `function`, Callback that sends the username.



### TAPIC.joinChannel(channel) 

Joins a new channel. If you were already in a channel, this exits you from that channel first, then joins the new one.

**Parameters**

**channel**: `string`, The channel name, with or without the #.



### TAPIC.sendChat(message) 

Sends a message to the channel. Actions such as /me, /host, etc work as normal. This is echoed back to the client if you listen for the "echoChat" event.

**Parameters**

**message**: `string`, The message to send.



### TAPIC.sendWhisper(user, message) 

Sends a whisper to a user. This is echoed back to the client if you listen for the "echoWhisper" event.

**Parameters**

**user**: `string`, The target user to send the whisper to.

**message**: `string`, The message to send.



### TAPIC.getUsername() 

Gets the username of the bot.

**Returns**: `string`, The lowercase username.


### TAPIC.getChannel() 

Gets the channel name.

**Returns**: `string`, The channel name in lowercase.


### TAPIC.isOnline() 

Gets the online status of the channel.

**Returns**: `boolean`, True if the channel is streaming, false if not.


### TAPIC.getStatus() 

Gets the status (title) of the channel. This works even if the channel is offline.

**Returns**: `string`, The status.


### TAPIC.getGame() 

Gets the game being played according to the channel owner. This works even if the channel is offline.

**Returns**: `string`, The game.


### TAPIC.getFollowerCount() 

Gets the number of followers of the channel.

**Returns**: `number`, The follower count.


### TAPIC.getTotalViewCount() 

Gets the total (cumulative) viewer count of the channel.

**Returns**: `number`, The total number of viewers.


### TAPIC.isPartner() 

Gets the partner status of the channel.

**Returns**: `boolean`, Returns true if the channel is a Twitch partner, false if not.


### TAPIC.getCurrentViewCount() 

Gets the number of current logged-in viewers of the channel.

**Returns**: `number`, The current number of logged-in viewers.


### TAPIC.getFps() 

Gets the channel's frames per second - generally 30 or 60.

**Returns**: `number`, The FPS of the channel.


### TAPIC.getVideoHeight() 

Gets the height in pixels of the video. This is often 480, 720, or 1080.

**Returns**: `number`, The height in pixels of the stream.


### TAPIC.getDelay() 

Gets the delay of the channel. This doesn't return the actual delay, just the intentionally added delay.

**Returns**: `number`, The delay in seconds.


### TAPIC.getSubBadgeUrl() 

Gets the URL of the subscriber badge displayed to the left of the username in chat if the channel is partnered.

**Returns**: `string`, The URL of the sub badge.


### TAPIC.getChatters() 

Gets the current chatters in the channel. The returned object has 5 arrays: moderators, staff, admins, global_mods, and viewers. The arrays are simple lists of the viewers that belong to each category.

**Returns**: `object`, An object of arrays.


### TAPIC.getCreatedAt() 

Gets the time the stream started in the W3C date and time format, in UTC. ex: 2014-09-20T21:00:43Z

**Returns**: `string`, The time the stream started.


### TAPIC.getLogo() 

Gets the channel's 300x300px logo URL.

**Returns**: `string`, The URL of the channel's logo.


### TAPIC.getVideoBanner() 

Gets the channel's offline video banner/image URL.

**Returns**: `string`, The URL of the channel's offline image.


### TAPIC.getProfileBanner() 

Gets the channel's profile banner URL.

**Returns**: `string`, The URL of the channel's profile banner.


### TAPIC.getDisplayName() 

Gets the display name of the user. This includes capitalization preferences.

**Returns**: `string`, The display name of the user.


### TAPIC.getColor() 

Gets the user's color preference for their username in chat. The format is hex and includes the leading #.

**Returns**: `string`, Color of the username.


### TAPIC.getEmoteSets() 

Gets the user's emote set in comma-delimited format.

**Returns**: `string`, List of the user's emote sets.


### TAPIC.getMod() 

Gets the moderator status of the user in the channel.

**Returns**: `boolean`, True if a moderator, false if not.


### TAPIC.getSub() 

Gets the subscriber status of the user in the channel.

**Returns**: `boolean`, True if a subscriber, false if not.


### TAPIC.getTurbo() 

Gets the turbo status of the user.

**Returns**: `boolean`, True if turbo, false if not.


### TAPIC.getUserType() 

Gets the user's usertype. For example, "staff".

**Returns**: `string`, User's user type.


### TAPIC.isFollowing(user, channel, callback) 

Checks if "user" is following "channel". This is an asynchronous function and requires a callback.

**Parameters**

**user**: `string`, The user name to check.

**channel**: `string`, The channel to check.

**callback**: `function`, The function that's called when the check is complete. Callback is given an object with isFollowing (boolean) and dateFollowed (string).



### TAPIC.isSubscribing(user, callback) 

Checks if "user" is subscribed to the current channel. This is an asynchronous function and requires a callback. Requires the channel_check_subscription permission and the username and channel must be the same.

**Parameters**

**user**: `string`, The user name to check.

**callback**: `function`, The function that's called when the check is complete. Callback is given an object with isSubscribing (boolean) and dateSubscribed (string).



### TAPIC.runCommercial(length) 

Runs a commercial. Requires channel_commercial permission and the user must be an editor of the channel or the username must be the same as the channel. Commercials usually run for 30 seconds.

**Parameters**

**length**: `number`, Amount of time to run the commercial in seconds.



### TAPIC.setStatusGame(status, game) 

Sets the status and game of the channel. Requires channel_editor permission.

**Parameters**

**status**: `string`, The status/title of the channel.

**game**: `string`, The game being played, or Creative or Music or whatever.



### TAPIC.listen(eventName, callback) 

Listens for certain events, then runs the callback.

**Parameters**

**eventName**: `string`, The name of the event.

**callback**: `function`, What do do when the event happens.



### TAPIC.emit(eventName, eventDetail) 

Emits an event.

**Parameters**

**eventName**: `string`, The name of the event.

**eventDetail**: `any`, The parameter to send the callback.




* * *










