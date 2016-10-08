module.exports = function (TAPIC, _ws, _event) {
  /**
  * Sends a whisper to a user. This is echoed back to the client if you listen for the "echoWhisper" event.
  * @param  {string} user The target user to send the whisper to.
  * @param  {string} message The message to send.
  * @function sendWhisper
  */
  TAPIC.sendWhisper = function (user, message) {
    if (typeof user != 'string' || typeof message != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.sendWhisper(user, message);');
      return;
    }
    if (!_ws) {
      return console.error('Tapic not setup.');
    }
    _ws.send('PRIVMSG #jtv :/w ' + user + ' ' + message);
    _event('echoWhisper', {
      to: user,
      text: message
    });
  };
};
