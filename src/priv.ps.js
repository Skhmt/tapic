module.exports = function (state, _event) {
  let ps;

  let pongTimeout;
  let pingTimeout;

  connect();
  function connect() {
    // cleaning up things
    clearTimeout(pingTimeout);
    clearTimeout(pongTimeout);
    // WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
    if (typeof ps === 'object') {
      if (ps.readyState === 1 || ps.readyState === 0) close();
    }

    const url = 'wss://pubsub-edge.twitch.tv';
    if (require('./isNode')) {
      let WS = require('ws');
      ps = new WS(url);
      ps.on('open', psOpen);
      ps.on('message', psMessage);
      ps.on('close', psClose);
      ps.on('error', psError);
    }
    else {
      ps = new WebSocket(url);
      ps.onopen = psOpen;
      ps.onmessage = psMessage;
      ps.onclose = psClose;
      ps.onerror = psError;
    }
  }

  // https://dev.twitch.tv/docs/v5/guides/PubSub/
  function psOpen() {
    _event('dev', 'pubsub - connected successfully');
    let frame = {
      type: 'LISTEN',
      nonce: 'listenToTopics',
      data: {
        topics: [
          'channel-bits-events-v1.' + state.channel_id,
          'chat_moderator_actions.' + state.id + '.' + state.channel_id,
          'whispers.' + state.id,
        ],
        auth_token: state.oauth,
      },
    };

    send(JSON.stringify(frame));

    ping();
  }

  function psClose() {
    _event('dev', 'pubsub - reconnect: psClose()');
    connect();
  }

  function psError(err) {
    console.error('pubsub error');
    console.error(err);
  }

  function ping() {
    send('{"type":"PING"}');
    _event('dev', 'pubsub - PING sent');
    
    pingTimeout = setTimeout(ping, 60*1000);

    pongTimeout = setTimeout(function () {
      _event('dev', 'pubsub - reconnect: ping() - pong timeout');
      connect();
    }, 10000); // if pong isn't received within 10 seconds, reconnect
  }

  // this provides some preventative error handling because the pubsub edge seems to be unstable
  function send(msg) {
    switch(ps.readyState) {
      case 0: // CONNECTING
        setTimeout(function () { send(msg); }, 1000);
        break;
      case 2: // CLOSING
      case 3: // CLOSED
        _event('dev', 'pubsub - reconnect: send() - closing/closed state');
        connect();
        break;
      case 1: // OPEN
        try {
          ps.send(msg);
        } catch (err) {
          console.error(err);
          setTimeout(function () { send(msg); }, 1500);
        }
        break;
      default:
        break;
		}
  }

  function close() {
    if (require('./isNode')) ps.on('close', function () {});
    else ps.onclose = function () {};
    ps.close();
  }

  function psMessage(event) {
    let message;
    if (require('./isNode')) message = JSON.parse(event);
    else message = JSON.parse(event.data);

    switch (message.type) {
      case 'PONG':
        _event('dev', 'pubsub - PONG received');
        clearTimeout(pongTimeout);
        break;
      case 'RESPONSE':
        break;
      case 'RECONNECT':
        _event('dev', 'pubsub - reconnect: psMessage() - was sent RECONNECT message');
        connect();
        break;
      case 'MESSAGE':
        parseMessage(message.data);
        break;
      default:
        _event('dev', 'pubsub uncaught message type:' + message);
    }
  }

  // data is message.data, so it should have msg.topic and msg.message
  function parseMessage(data) {
    switch (data.topic) {
      // https://dev.twitch.tv/docs/v5/guides/PubSub/
      case 'channel-bits-events-v1.' + state.channel_id:
        bits();
        break;
      // https://discuss.dev.twitch.tv/t/in-line-broadcaster-chat-mod-logs/7281/12
      case 'chat_moderator_actions.' + state.id + '.' + state.id:
        moderation();
        break;
      case 'whispers.' + state.id:
        whisper();
        break;
      default:
        break;
    }

    function bits() {
      let bits = JSON.parse(data.message);
      _event('bits', bits);
    }

    function moderation() {
      let moderation = JSON.parse(data.message).data;
      _event('moderation', moderation);
    }

    function whisper() {
      let message = JSON.parse(data.message).data_object;
      // TODO: figure out why some whispers are dropped...
      // _event('whisper', message);
    }
  }
};
