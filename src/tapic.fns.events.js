module.exports = function (TAPIC) {
  let _events = new Map();

  function _event(eventName, eventDetail) {
    if (_events.has(eventName)) {
      let callbacks = _events.get(eventName); // gets an array of callback functions
      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i](eventDetail); // runs each and sends them eventDetail as the parameter
      }
    }
  }

  /**
  * Listens for certain events, then runs the callback.
  * @param  {string} eventName The name of the event.
  * @param  {function} callback  What do do when the event happens.
  * @function listen
  */
  TAPIC.listen = function (eventName, callback) {
    if (typeof eventName != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.listen(eventName[, callback]);');
      return;
    }
    if (typeof callback !== 'function') return console.error('Callback needed.');
    if (_events.has(eventName)) { // if there are listeners for eventName
      let value = _events.get(eventName); // get the current array of callbacks
      value.push(callback); // add the new callback
      _events.set(eventName, value); // replace the old callback array
    } else { // if eventName has no listeners
      _events.set(eventName, [callback]);
    }
  };

  /**
  * Emits an event.
  * @param  {string} eventName   The name of the event.
  * @param  {any} eventDetail The parameter to send the callback.
  * @function emit
  */
  TAPIC.emit = function (eventName, eventDetail) {
    if (typeof eventName != 'string' || typeof eventDetail != 'string') {
      console.error('Invalid parameters. Usage: TAPIC.emit(eventName, eventDetail);');
      return;
    }
    _event(eventName, eventDetail);
  };

  return _event;
};
