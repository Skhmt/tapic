# tapic.js
A Twitch API and Chat library in javascript.

View the complete reference docs here: https://skhmt.github.io/tapic/

---

### Installation

Download `tapic.js` and include in your webpage via: `<script src="tapic.js"></script>`.

See `examples/web/index.html` for examples on every part of tapic.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in a client id and oauth token in `index.html` for it to work.

Or install via NPM: `npm install tapic --only=production`.

---

### Building

`npm install` if you've already installed it in the previous section, or `npm install tapic` if you haven't

`npm run build`

---

### To Do

* Fix Community updates in pingAPI when Dallas fixes the Twitch API
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
