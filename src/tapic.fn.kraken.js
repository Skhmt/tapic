module.exports = function (TAPIC, _getJSON) {
  /**
  * Uses tapic.js to do calls to the twitchapi that aren't supported by default at https://api.twitch.tv/kraken/...
  * Example: TAPIC.kraken('games/top/', '&limit=100&offset=0', function (response) {...});
  * @param  {string} path     The url to after "/kraken/"
  * @param  {string} params  Optional. Query parameters in the format of "&___=___&___=___ ...".
  * @param  {function} callback Callback function is given the response object, see https://dev.twitch.tv/docs for specific info
  * @function kraken
  */
  TAPIC.kraken = function (path, arg2, arg3) {
    const URL = 'https://api.twitch.tv/kraken/';

    if (typeof path === 'string' && typeof arg2 === 'string' && typeof arg3 === 'function') {
      _getJSON(URL + path, arg2, function (res) { arg3(res); });
    }
    else if (typeof path === 'string' && typeof arg2 === 'function') {
      _getJSON(URL + path, function (res) { arg2(res); });
    }
    else {
      return console.error('Invalid parameters. Usage: TAPIC.kraken(path, [params,] callback);');
    }
  };
};
