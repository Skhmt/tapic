# twapi.js
Twitch Websockets &amp; API javascript framework.

This contains more or less everything you'd need from the Twitch API accessed via function calls, with data refreshed every minute.
This also has twitch chat via websockets, which is accessed via eventListeners.

See test.html for examples on every part of twapi.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in a client id and oauth token in test.html for it to work. 

This is made for use in a client-side website, no server required. Use cases are basically: CLR/BrowserSource on OBS, client-side websites, Electron, and NW.js. It will work in Node.js with ``npm install ws``.

This was written entirely in Javascript and has no dependencies besides a relatively up-to-date browser.

Compile for a minified version at `http://closure-compiler.appspot.com/home` or use it from `skhmt.github.io/twapi/twapi.min.js`
