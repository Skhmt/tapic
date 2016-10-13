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
          'chat_moderator_actions.' + state.id + '.' + state.id,
          'channel-bitsevents.' + state.id,
        ],
        auth_token: state.oauth,
      },
    };
    ps.send(JSON.stringify(frame));
    ping();
  }

  function ping() {
    ps.send(JSON.stringify({type:"PING"}));
    setTimeout(ping, 120000); // 120,000 = 2 minutes
  }

  function psMessage(event) {
    let message = JSON.parse(event.data);
    console.log(message);
    switch (message.type) {
      case 'PONG':
        break;
      case 'RECONNECT':
        connect();
        break;
      case 'RESPONSE':
        break;
      case 'MESSAGE':
        parseMessage(message.data);
        break;
      default:
        console.log('Unknown message type received in pubsub.');
        console.log(message);
        break;
    }
  }

  // data is message.data, so it should have msg.topic and msg.message
  function parseMessage(data) {
    switch (data.topic) {
      // https://dev.twitch.tv/docs/PubSub/bits/
      case 'channel-bitsevents.' + state.id:
        const username = data.message.user_name;
        const note = data.message.chat_message;
        const bits = data.message.bits_used;
        const totalBits = data.message.total_bits_used;
        _event('bits', {username, note, bits, totalBits});
        break;
      // https://discuss.dev.twitch.tv/t/in-line-broadcaster-chat-mod-logs/7281/12
      case 'chat_moderator_actions.' + state.id + '.' + state.id:
        const action = data.message.moderation_action;
        const username = data.message.created_by;
        const args = data.message.args;
        _event('moderation', {username, action, args});
        break;
      default:
        break;
    }
  }
};
