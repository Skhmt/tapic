let TAPIC = require('../../dist/tapic.js');

let clientid = '';
let oauth = '';

TAPIC.setup(clientid, oauth, function (username) {
  // This is also required for a lot of things to work
  let channel = username;
  TAPIC.joinChannel(channel, function () {
    tests();
  });
});

TAPIC.listen('raw', function (e) {
  // You really don't NEED to see raw messages. But you can if you want.
  // You can also manually parse the raw messages if you don't trust TAPIC.js
  // writeChat( '* ' + e );
  console.info(e);
});

function tests() {
  // TODO make some tests
}
