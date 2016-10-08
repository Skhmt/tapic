module.exports = function (TAPIC, state, _ws, _event) {
  /**
  * Sends a message to the channel. Actions such as /me, /host, etc work as normal. This is echoed back to the client if you listen for the "echoChat" event.
  * @param  {string} message The message to send.
  * @function sendChat
  */
  TAPIC.sendChat = function (message) {
    if (typeof message != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.sendChat(message);');
      return;
    }
    if (!_ws) {
      return console.error('Tapic not setup.');
    }
    _ws.send('PRIVMSG #' + state.channel + ' :' + message);
    _event('echoChat', message);
  };
};
