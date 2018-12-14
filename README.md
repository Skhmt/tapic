*Twitch is removing v3 of their API at the end of 2018. This was built with v3 in mind, and I highly doubt v5 is compatible with this project.* I, unfortunately, have lost interest in developing for twitch, but the `New Twitch API` looks pretty good out of the box. So if this continues to work in 2019, great. If it doesn't, I won't be providing support any longer as it would require a full rewrite of `tapic.js`. Sorry guys, that's just how Twitch is doing things. This is licensed under MIT, so fork and upgrade it to your heart's content.





# tapic.js
A Twitch API and Chat library in javascript.

This works in both Node.js and modern browsers. It makes accessing chat as easy as listening to events and it automatically polls the Twitch API 
at regular intervals, making lots of data accessible instantly that's at most a couple of seconds old, all without having to deal with 
HTTP requests, JSONP, IRC, Websockets, or anything else besides simple Javascript. At around 23KB minified, it's also light weight. 

Tapic.js has coverage of most of the Twitch API, and makes accessing those last bits easy too.

View the complete reference docs here: https://skhmt.github.io/tapic/

---

### Installation

Download `tapic.js` or `tapic.min.js` from the `/dist/` folder and include in your webpage via: `<script src="tapic.js"></script>`.

See `examples/web/index.html` for examples on every part of tapic.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in an oauth token in `index.html` for it to work.

Alternatively, install via NPM: `npm install tapic --only=production` and include in your Node.js app via: `let TAPIC = require('tapic');`.

Alternatively alternatively, include using the rawgit cdn:

```
<script src="https://cdn.rawgit.com/Skhmt/tapic/68a5e602/dist/tapic.min.js" integrity="sha384-tP/u941NluOMSS+4cQL8NCM9f0WZyXZ54BqeEVduqQyZGv2DZfXkZgIutpwpeMbO" crossorigin="anonymous"></script>
```

---

### Building

Navigate to the tapic directory

`npm install`

`npm run build`

---

### Misc

This was written entirely in Javascript and has no runtime dependencies besides "[ws](https://www.npmjs.com/package/ws)" when used in node.

MIT License.
