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

/**
* Bit tip notification. Via PubSub.
* @event bits
* @property {string} message_id - Message ID
* @property {string} message_type - Message type (that is, the type of object contained in the data field)
* @property {string} version - Message version
* @property {object} data.badge_entitlement - Information about the user’s new badge level (.new_version and .previous_version), if the user reached a new badge level with this cheer; otherwise. null.
* @property {number} data.bits_used - Number of bits used.
* @property {string} data.channel_id - 	User ID of the channel on which bits were used.
* @property {string} data.channel_name - Name of the channel on which bits were used.
* @property {string} data.chat_message - Chat message sent with the cheer.
* @property {string} data.context - Event type associated with this use of bits (for example, cheer).
* @property {string} data.time - Time when the bits were used. RFC 3339 format.
* @property {number} data.total_bits_used - All-time total number of bits used on this channel by the specified user.
* @property {string} data.user_id - User ID of the person who used the bits.
* @property {string} data.user_name - Login name of the person who used the bits.
*/

/**
* Moderation actions. Via PubSub. Unsupported - may not work.
* @event moderation
* @property {string} type - should be "chat_login_moderation"
* @property {string} moderation_action - "timeout", "ban", etc
* @property {array} args - 
* @property {string} created_by - 
*/
