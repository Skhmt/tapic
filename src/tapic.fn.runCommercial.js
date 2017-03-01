module.exports = function (TAPIC, state) {
  /**
  * Runs a commercial. Requires channel_commercial permission and the user must be an editor of the channel or the username must be the same as the channel. Commercials usually run for 30 seconds.
  * @param  {number} length Amount of time to run the commercial in seconds.
  * @function runCommercial
  */
  TAPIC.runCommercial = function (length) {
    if (typeof length != 'number') {
      console.error('Invalid parameters. Usage: TAPIC.runCommercial(length);');
      return;
    }
    if (!state.channel) return console.error('Not in a channel.');
    if (!state.partner) return console.error('Not a partner, cannot run a commercial.');

    const host = 'https://api.twitch.tv';
    const path = '/kraken/channels/' + state.channel_id + '/commercial?oauth_token=' + state.oauth;
    const url = host + path;

    if (require('./isNode')) {
      let options = {
        host: host,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Client-ID': state.clientid
        }
      };
      let http = require('https');
      http.request(options).write({'duration': length}).end();
    } else {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      xhr.setRequestHeader('Client-ID', state.clientid);
      xhr.send({'duration': length});
    }
  };
};
