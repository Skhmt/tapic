module.exports = function (state, _ps, _event) {
  // handling messages
  if (require('./isNode')) {
    _ps.on('open', psOpen);
    _ps.on('message', psMessage);
  } else {
    _ps.onopen = psOpen;
    _ps.onmessage = psMessage;
  }

  // https://github.com/justintv/Twitch-API/tree/master/PubSub#receiving-messages
  // https://discuss.dev.twitch.tv/t/in-line-broadcaster-chat-mod-logs/7281
  function psOpen() {
    _ps.send('{"type":"PING"}');
    let frame = {
      type: 'LISTEN',
      data: {
        topics: [
          "chat_moderator_actions." + state.id,
        ]
      },
      auth_token: state.oauth,
    };
    _ps.send(JSON.stringify(frame));
  }

  function psMessage(event) {
    let message = JSON.parse(event.data);
    console.log(message)
  }
};
