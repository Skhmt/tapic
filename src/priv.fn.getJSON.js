module.exports = function (state) {
  function _getJSON (path, params, callback) {
    const timeoutLength = 5;
    let timeout = setTimeout(function() {
      return callback({error:`Request timeout after ${timeoutLength} seconds.`});
    }, timeoutLength * 1000);

    const oauthString = '?oauth_token=' + state.oauth;
    const apiString = '&api_version=5';

    let url = path + oauthString + apiString;
    if (state.clientid) url += '&client_id=' + state.clientid;
    if (typeof params === 'string') {
      url += params;
    } else if (typeof params === 'function') {
      callback = params;
    }

    if (typeof callback !== 'function') return console.error('Callback needed.');
    
    if (require('./isNode')) { // No jsonp required, so using http.get
      let http = require('https');
      http.get(url, function (res) {
        // res.setTimeout(timeoutMS, function() {
        //   res.emit('close');
        // });

        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          output += chunk;
        });
        res.on('end', function () {
          if (res.statusCode === 204) {
            clearTimeout(timeout);
            return callback(output);
          }
          else if (res.statusCode >= 200 && res.statusCode < 400) {
            try {
              clearTimeout(timeout);
              return callback(JSON.parse(output));
            } catch (err) {
              clearTimeout(timeout);
              return console.error(err + '@' + path);
            }
          } else { // error
            clearTimeout(timeout);
            return console.error(output + '@' + path);
          }
        });
      }).on('error', function (e) {
        clearTimeout(timeout);
        return console.error(e.message + '@' + path);
      });
    } else { //jsonp for browsers
      // Keep trying to make a random callback name until it finds a unique one.
      let randomCallback;
      do {
        randomCallback = 'tapicJSONP' + Math.floor(Math.random() * 1000000000);
      } while (window[randomCallback]);

      window[randomCallback] = function (json) {
        clearTimeout(timeout);
        delete window[randomCallback]; // Cleanup the window object
        return callback(json);
      };

      let node = document.createElement('script');
      node.id = randomCallback;
      node.src = url + '&callback=' + randomCallback;
      node.onerror = ev => {
        // can do something with an error here... but not going to.
      };

      try {
        document.getElementById('tapicJsonpContainer').appendChild(node);
      } catch(e) {
        let tapicContainer = document.createElement('div');
        tapicContainer.id = 'tapicJsonpContainer';
        tapicContainer.style.cssText = 'display:none;';
        document.getElementsByTagName('body')[0].appendChild(tapicContainer);
        tapicContainer.appendChild(node);
      }
    }

  } // close _getJSON
  return _getJSON;
};
