# tapic.js
A Twitch API and Chat library in javascript.

View the complete reference docs here: https://skhmt.github.io/tapic/

---

### Installation

Download `tapic.js` and include in your webpage via: `<script src="tapic.js"></script>`.

See `examples/test.html` for examples on every part of tapic.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in a client id and oauth token in `test.html` for it to work.

Or install via NPM: `npm install tapic`.

---

### Building

`npm install`

`npm run build`

---

### To Do

* Transition whispers from irc/ws to pub/sub
* Finish Communities
* Finish Channel Feed

---

### Misc

This was written entirely in Javascript and has no runtime dependencies besides [ws](https://www.npmjs.com/package/ws) when used in node.

MIT License.
