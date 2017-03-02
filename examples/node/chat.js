let TAPIC = require('../../dist/tapic.js');

let oauth = '';

TAPIC.setup(oauth, function (username) {
  // This is also required for a lot of things to work
  let channel = username;
  TAPIC.joinChannel(channel, function () {
    tests();
  });
});

TAPIC.listen('raw', event => console.log(event));

TAPIC.listen('echoChat', event => console.log('> ' + event));

function tests() {
  // run some tests, see ../web/index.html for examples
}

// Console stuff

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('');
rl.prompt();

rl.on('line', line => {
  TAPIC.sendChat(line);
  rl.prompt();
});
