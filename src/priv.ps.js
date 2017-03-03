module.exports = function (state, _event) {
  let ps;

  connect();
  function connect() {
    const url = 'wss://pubsub-edge.twitch.tv';
    if (require('./isNode')) {
      let WS = require('ws');
      ps = new WS(url);
      ps.on('open', psOpen);
      ps.on('message', psMessage);
    }
    else {
      ps = new WebSocket(url);
      ps.onopen = psOpen;
      ps.onmessage = psMessage;
    }
  }

  // https://dev.twitch.tv/docs/PubSub/overview/
  function psOpen() {
    let frame = {
      type: 'LISTEN',
      data: {
        topics: [
          'chat_moderator_actions.' + state.id + '.' + state.channel_id,
          'channel-bits-events-v1.' + state.channel_id,
          'whispers.' + state.id
        ],
        auth_token: state.oauth,
      },
    };
    ps.send(JSON.stringify(frame));
    ping();
  }

  function ping() {
    ps.send("{'type':'PING'}");
    setTimeout(ping, 120000); // 120,000 = 2 minutes
  }

  function psMessage(event) {
    let message;
    if (require('./isNode')) message = JSON.parse(event);
    else message = JSON.parse(event.data);

    switch (message.type) {
      case 'PONG':
      case 'RESPONSE':
        break;
      case 'RECONNECT':
        connect();
        break;
      case 'MESSAGE':
        parseMessage(message.data);
        break;
      default:
        console.log('Unknown message type received in pubsub.');
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
      // TODO finish this
    }
  }
};
