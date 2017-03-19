module.exports = function (TAPIC, state) {
  /**
  * Gets the uptime that TAPIC has been running. This is not the stream's uptime. 
  * @return {object} "total" is the total uptime in miliseconds, if you want to parse it yourself. "hours", "minutes", and "seconds" are integers meant to be used together.
  * @function getTapicUptime
  */
  TAPIC.getTapicUptime = function () {
    let total = Date.now() - state.startTime;

    let totalSeconds = total / 1000;
    let seconds = (totalSeconds % 60)|0;

    let totalMinutes = totalSeconds / 60;
    let minutes = (totalMinutes % 60)|0;

    let hours = (totalMinutes / 60)|0;

    return {
      total,
      seconds,
      minutes,
      hours,
    };
  };
};
