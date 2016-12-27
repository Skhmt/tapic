module.exports = function (state, _event) {
  function _parseMessage (text) {
    _event('raw', text);
    let textarray = text.split(' ');

    if (textarray[2] === 'PRIVMSG') {
      // chat
      // :twitchstate.username!twitchstate.username@twitchstate.username.tmi.twitch.tv PRIVMSG #channel :message here
      _msgPriv(textarray);
    }
    else if (textarray[1] === 'PRIVMSG') {
      // host
      _event('host', textarray[3].substring(1));
    }
    else if (textarray[2] === 'NOTICE') {
      // notice
      // @msg-id=slow_off :tmi.twitch.tv NOTICE #channel :This room is no longer in slow mode.
      _msgNotice(textarray);
    }
    else if (textarray[1] === 'JOIN') {
      // join
      // :twitchstate.username!twitchstate.username@twitchstate.username.tmi.twitch.tv JOIN #channel
      _msgJoin(textarray);
    }
    else if (textarray[1] === 'PART') {
      // part
      // :twitchstate.username!twitchstate.username@twitchstate.username.tmi.twitch.tv PART #channel
      _msgPart(textarray);
    }
    else if (textarray[2] === 'ROOMSTATE') {
      // roomstate
      // @broadcaster-lang=;r9k=0;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #channel
      _msgRoomstate(textarray);
    }
    else if (textarray[2] === 'WHISPER') {
      // whisper
      // @badges=;color=#FF69B4;display-name=littlecatbot;emotes=;message-id=21;thread-id=71619374_108640872;turbo=0;user-id=108640872;user-type= :littlecatbot!littlecatbot@littlecatbot.tmi.twitch.tv WHISPER skhmt :hello world
      _msgWhisper(textarray);
    }
    else if (textarray[2] === 'CLEARCHAT') {
      // clear chat
      // @room-id=71619374 :tmi.twitch.tv CLEARCHAT #skhmt

      // ban/timeout
      // @ban-duration=1;ban-reason=Follow\sthe\srules :tmi.twitch.tv CLEARCHAT #channel :targetstate.username
      // @ban-reason=Follow\sthe\srules :tmi.twitch.tv CLEARCHAT #channel :targetstate.username
      if (textarray.length === 3) _event('clearChat');
      else _msgBan(textarray);  
    }
    else if (textarray[2] === 'USERSTATE') {
      // userstate
      // @color=#0D4200;display-name=UserNaME;emote-sets=0,33;mod=1;subscriber=1;turbo=1;user-type=staff :tmi.twitch.tv USERSTATE #channel
      _msgUserstate(textarray);
    }
    else if (textarray[2] === 'USERNOTICE') {
      // sub notifications for now, may change in the future
      // @badges=staff/1,broadcaster/1,turbo/1;color=#008000;display-name=TWITCHstate.username;emotes=;mod=0;msg-id=resub;msg-param-months=6;room-id=1337;subscriber=1;system-msg=TWITCHstate.username\shas\ssubscribed\sfor\s6\smonths!;login=twitchstate.username;turbo=1;user-id=1337;user-type=staff :tmi.twitch.tv USERNOTICE #channel :Great stream -- keep it up!
      _msgSub(textarray);
    }
    else {
      // not recognized by anything else
      // console.info('Uncaught message type:' + textarray);
    }
  }

  function _parseTags (tagString) {
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

  function _msgWhisper (textarray) {
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

  function _msgPriv (textarray) {
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

  function _msgNotice (textarray) {
    textarray.splice(0, 4);
    const output = textarray.join(' ').substring(1);
    _event('notice', output);
  }

  function _msgJoin (textarray) {
    const joinname = textarray[0].split('!')[0].substring(1);
    _event('join', joinname);
  }

  function _msgPart (textarray) {
    const partname = textarray[0].split('!')[0].substring(1);
    _event('part', partname);
  }

  function _msgRoomstate (textarray) {
    const roomstateTags = _parseTags(textarray[0]);
    _event('roomstate', {
      lang: roomstateTags.get('broadcaster-lang'),
      r9k: roomstateTags.get('r9k'),
      slow: roomstateTags.get('slow'),
      subs_only: roomstateTags.get('subs-only')
    });
  }

  function _msgBan (textarray) {
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

  function _msgUserstate (textarray) {
    const userstateTags = _parseTags(textarray[0]);
    state.userColor = userstateTags.get('color');
    state.userDisplayName = userstateTags.get('display-name');
    state.userEmoteSets = userstateTags.get('emote-sets');
    state.userMod = userstateTags.get('mod');
    state.userSub = userstateTags.get('subscriber');
    state.userTurbo = userstateTags.get('turbo');
    state.userType = userstateTags.get('user-type');
  }

  function _msgSub (textarray) {
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
