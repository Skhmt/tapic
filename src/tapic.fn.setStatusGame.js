module.exports = function (TAPIC, state) {
  /**
  * Sets the status and game of the channel. Requires channel_editor permission.
  * @param  {string} status The status/title of the channel.
  * @param  {string} game   The game being played, or Creative or Music or whatever.
  * @function setStatusGame
  */
  TAPIC.setStatusGame = function (status, game) {
    if (typeof status != 'string' || typeof game != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.setStatusGame(status, game);');
      return;
    }

    _getJSON('https://api.twitch.tv/kraken/channels/' + state.channel_id,
      '&_method=put&channel[status]=' + encodeURIComponent(status) + '&channel[game]=' + encodeURIComponent(game),
      function (res) {
        state.game = res.game;
        state.status = res.status;
      }
    );

    // const host = 'https://api.twitch.tv';
    // let path = '/kraken/channels/' + state.channel_id;
    //     path += '?channel[status]=' + encodeURIComponent(status);
    //     path += '&channel[game]=' + encodeURIComponent(game);
    //     path += '&_method=put&oauth_token=' + state.oauth;

    // if (require('./isNode')) {
    //   let options = {
    //     host: host,
    //     path: path,
    //     headers: {
    //       'Client-ID': state.clientid
    //     }
    //   };
    //   let http = require('https');
    //   http.get(options, function (res) {
    //     let output = '';
    //     res.setEncoding('utf8');
    //     res.on('data', function (chunk) {
    //       output += chunk;
    //     });
    //     res.on('end', function () {
    //       if (res.statusCode >= 200 && res.statusCode < 400) {
    //         const resp = JSON.parse(output);
    //         state.game = resp.game;
    //         state.status = resp.status;
    //       } else { // error
    //         console.error(output);
    //       }
    //     });
    //   }).on('error', function (e) {
    //     console.error(e.message);
    //   });
    // } else { // vanilla JS
    //   let xhr = new XMLHttpRequest();
    //   xhr.open('GET', host + path, true);
    //   xhr.setRequestHeader('Client-ID', state.clientid);
    //   xhr.onload = function () {
    //     if (xhr.status >= 200 && xhr.status < 400) {
    //       const resp = JSON.parse(xhr.responseText);
    //       state.game = resp.game;
    //       state.status = resp.status;
    //     } else {
    //       // We reached our target server, but it returned an error
    //       console.error(xhr.responseText);
    //     }
    //   };
    //   xhr.onerror = function () {
    //     // There was a connection error of some sort
    //     console.error(xhr.responseText);
    //   };
    //   xhr.send();
    // }
  };
};
