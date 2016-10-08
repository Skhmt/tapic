module.exports = function (state) {
  function _getJSON (path, params, callback) {
    const oauthString = '?oauth_token=' + state.oauth;
    const apiString = '&api_version=3';
    const clientString = '&client_id=' + state.clientid;

    let url = path + oauthString + apiString + clientString;
    if (typeof params === 'string') {
      url += params;
    } else if (typeof params === 'function') {
      callback = params;
    }

    if (typeof callback !== 'function') return console.error('Callback needed.');
    if (require('./isNode')) { // No jsonp required, so using http.get
      let http = require('https');
      http.get(url, function (res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          output += chunk;
        });
        res.on('end', function () {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            callback(JSON.parse(output));
          } else { // error
            console.error(output);
          }
        });
      }).on('error', function (e) {
          console.error(e.message);
      });
    } else {
      // Keep trying to make a random callback name until it finds a unique one.
      let randomCallback;
      do {
        randomCallback = 'tapicJSONP' + Math.floor(Math.random() * 1000000000);
      } while (window[randomCallback]);

      window[randomCallback] = function (json) {
        callback(json);
        delete window[randomCallback]; // Cleanup the window object
      };

      let node = document.createElement('script');
      node.src = url + '&callback=' + randomCallback;
      try {
        document.getElementById('tapicJsonpContainer').appendChild(node);
      } catch(e) {
        let tapicContainer = document.createElement('div');
        tapicContainer.id = 'tapicJsonpContainer';
        tapicContainer.style.cssText = 'display:none;';
        document.getElementsByTagName('body')[0].appendChild(tapicContainer);
        document.getElementById('tapicJsonpContainer').appendChild(node);
      }

    }
  }
  return _getJSON;
};
