module.exports = function (state, _ws, _parseMessage, callback) {
  // handling messages
  if (require('./isNode')) {
    _ws.on('open', wsOpen);
    _ws.on('message', wsMessage);
  } else {
    _ws.onopen = wsOpen;
    _ws.onmessage = wsMessage;
  }

  function wsOpen() {
    _ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
    _ws.send('PASS oauth:' + state.oauth);
    _ws.send('NICK ' + state.username);
  }

  function wsMessage(event) {
    let messages;
    // websockets can have multiple separate messages per event
    if (require('./isNode')) messages = event.split('\r\n');
    else messages = event.data.split('\r\n');

    for (let i = 0; i < messages.length; i++) {
      let msg = messages[i];
      if (msg === 'PING :tmi.twitch.tv') {
        _ws.send('PONG :tmi.twitch.tv');
      } else if (msg) {
        _parseMessage(msg);
        if (msg.substring(0,18) === ':tmi.twitch.tv 001' && typeof callback == 'function') callback(state.username);
      }
    }
  } // end wsMessage
};
