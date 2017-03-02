module.exports = function (TAPIC, state) {
  /**
  * Sets the rate at which tapic pings the Twitch API, by default it's 5
  * @param  {number} refreshRate in seconds
  * @function setRefreshRate
  */
  TAPIC.setRefreshRate = function (rate) {
    if (typeof rate != 'number') {
      return console.error('Invalid parameter. Usage: TAPIC.setRefreshRate(refreshRate);');
    }

    // Not allowing a faster refresh rate than 5 seconds
    if (rate >= 5.0) state.refreshRate = rate;
  };
};
