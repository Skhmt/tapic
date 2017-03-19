// exporting if node, defining as a global function if browser
if (require('./isNode')) __nodeModule__.exports = define_TAPIC();
else window.TAPIC = define_TAPIC();

function define_TAPIC() {

  let TAPIC = {}; // this is the return object
  let state = require('./priv.obj.state');
  let _ws;
  let _event = require('./tapic.fns.events')(TAPIC);
  let _getJSON = require('./priv.fn.getJSON')(state);
  let _parseMessage = require('./priv.fn.parseMessage')(state, _event);
  let _pingAPI = require('./priv.fn.pingAPI')(state, _event, _getJSON);
  let _getSubBadgeUrl = require('./priv.fn.getSubBadgeUrl')(state, _getJSON);

  /**
  * Sets the oauth, then opens a chat connection and starts polling the Twitch API for data. This needs to be done before joining a channel.
  * @param  {string} oauth Your user's oauth token. See: https://github.com/justintv/Twitch-API/blob/master/authentication.md for instructions on how to do that.
  * @param  {function} callback Calls back the username when TAPIC has successfully connected to Twitch.
  * @function setup
  */
  TAPIC.setup = function (oauth, callback) {
    if (typeof oauth !== 'string' || oauth.length === 0) {
      console.error('Invalid parameters. Usage: TAPIC.setup(oauth[, callback]);');
      return;
    }
    
    state.oauth = oauth.replace('oauth:', '');

    state.startTime = Date.now();

    _getJSON('https://api.twitch.tv/kraken', function (res) {
      if (res.error && res.error === "Bad Request") {
        console.error('Invalid Client ID or Oauth token.');
        return;
      }
      state.username = res.token.user_name;
      state.id = res.token.user_id;
      state.clientid = res.token.client_id;
      _init(callback);
    });
  };

  function _init(callback) {
    // setting up websockets
    const twitchWS = 'wss://irc-ws.chat.twitch.tv:443';
    if (require('./isNode')) {
      let WS = require('ws');
      _ws = new WS(twitchWS);
    } else {
      _ws = new WebSocket(twitchWS);
    }

    require('./priv.ws')(state, _ws, _parseMessage, _event, callback);
    require('./priv.ps')(state, _event);

    // TAPIC.joinChannel(channel, callback)
    require('./tapic.fn.joinChannel')(TAPIC, state, _ws, _getSubBadgeUrl, _pingAPI, _getJSON);

    // TAPIC.sendChat(message)
    require('./tapic.fn.sendChat')(TAPIC, state, _ws, _event);

    // TAPIC.sendWhisper(user, message)
    require('./tapic.fn.sendWhisper')(TAPIC, _ws, _event);

    // TAPIC.isFollowing(user, channel, callback)
    require('./tapic.fn.isFollowing')(TAPIC, _getJSON);

    // TAPIC.isSubscribing(user, callback)
    require('./tapic.fn.isSubscribing')(TAPIC, state, _getJSON);

    // TAPIC.get[...]
    require('./tapic.fns.getters')(TAPIC, state);

    // TAPIC.runCommercial(length)
    require('./tapic.fn.runCommercial')(TAPIC, state);

    // TAPIC.setStatusGame(status, game)
    require('./tapic.fn.setStatusGame')(TAPIC, state, _getJSON);

    // TAPIC.joinCommunity(community)
    require('./tapic.fn.joinCommunity')(TAPIC, state, _getJSON);

    // TAPIC.leaveCommunity()
    require('./tapic.fn.leaveCommunity')(TAPIC, state, _getJSON);

    // TAPIC.findID(username, callback)
    require('./tapic.fn.findID')(TAPIC, _getJSON);

    // TAPIC.setRefreshRate(rateInSeconds)
    require('./tapic.fn.setRefreshRate')(TAPIC, state);

    // TAPIC.kraken(path, [params ,] callback)
    require('./tapic.fn.kraken')(TAPIC, _getJSON);

    // TAPIC.getUptime()
    require('./tapic.fn.getTapicUptime')(TAPIC, state);
  } // init()

  require('./doc.events');

  return TAPIC;
}
