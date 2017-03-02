# tapic.js
A Twitch API and Chat library in javascript.

This works in both Node.js and modern browsers. It makes accessing chat as easy as listening to events and it automatically polls the Twitch API 
at regular intervals, making lots of data accessible instantly that's at most a couple of seconds old, all without having to deal with 
HTTP requests, JSONP, IRC, or anything else besides simple Javascript. At around 23KB minified, it's also light weight. 

Tapic.js has coverage of most of the Twitch API, and makes accessing those last bits easy too.

View the complete reference docs here: https://skhmt.github.io/tapic/

---

### Installation

Download `tapic.js` or `tapic.min.js` from the `/dist/` folder and include in your webpage via: `<script src="tapic.js"></script>`.

See `examples/web/index.html` for examples on every part of tapic.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in an oauth token in `index.html` for it to work.

Alternatively, install via NPM: `npm install tapic --only=production` and include in your Node.js app via: `let TAPIC = require('tapic');`.

---

### Building

Navigate to the tapic directory

`npm install`

`npm run build`

---

### To Do (as of 2 March 2017)

* Transition whispers from irc/ws to pub/sub
* Finish Communities
* Finish Channel Feed
* Update bits pub/sub
* Option for message length limit check
* Option for messages / 30 seconds limit check

---

### Misc

This was written entirely in Javascript and has no runtime dependencies besides [ws](https://www.npmjs.com/package/ws) when used in node.

MIT License.
