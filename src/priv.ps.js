module.exports = function (state, _event) {
  let ps;

  let pongTimeout = '';

  connect();
  function connect() {
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
    try {
      ps.send(JSON.stringify(frame));
    } catch(e) {
      setTimeout(function() {
        ps.send(JSON.stringify(frame));
      }, 1000);
    }
    ping();
  }

  function psClose() {
    connect();
  }

  function psError(err) {
    console.error('pubsub error');
    console.log(err);
  }

  function ping() {
    try {
      ps.send('{"type":"PING"}');
    } catch(err) {
      setTimeout(function() {
        ps.send('{"type":"PING"}');
      }, 2000);
    }
    
    setTimeout(ping, 60000); // 60,000 = 1 minute

    pongTimeout = setTimeout(function() {
      connect();
    }, 10000); // if pong isn't received within 10 seconds, reconnect
  }

  function psMessage(event) {
    let message;
    if (require('./isNode')) message = JSON.parse(event);
    else message = JSON.parse(event.data);

    switch (message.type) {
      case 'PONG':
        clearTimeout(pongTimeout);
        break;
      case 'RESPONSE':
        break;
      case 'RECONNECT':
        connect();
        break;
      case 'MESSAGE':
        parseMessage(message.data);
        break;
      default:
        console.log('Uncaught message type received in pubsub.');
        console.log(message);
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
