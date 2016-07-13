# tapic.js
Twitch API and Chat in Javascript. 

(Formerly known as TWAPI.js)

View the much more complete reference docs here: https://skhmt.github.io/tapic/

This contains more or less everything you'd need from the Twitch API accessed via function calls, with data refreshed every 10 seconds or so.
This also has twitch chat via websockets, which is accessed via eventListeners.

See test.html for examples on every part of tapic.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in a client id and oauth token in test.html for it to work. 

This is made for use in a client-side app, no server required. Use cases are basically: CLR/BrowserSource on OBS, client-side websites, Electron, and NW.js.

It will work in Node.js: ``npm install tapic``.

This was written entirely in Javascript and has no dependencies besides ``ws`` when used in node or a relatively up-to-date browser.

Compile for a minified version at `http://closure-compiler.appspot.com/home`
