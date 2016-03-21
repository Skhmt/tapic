# twapi.js
Twitch Websockets &amp; API.
This contains more or less everything you'd need from the Twitch API accessed via function calls, with data refreshed every minute.
This also has twitch chat via websockets, which are accessed via eventListeners.

See test.html for examples on every part of twapi.js. Open up the console (F12 or ctrl-shift-i) to see the test outputs.
You will need to put in a client id and oauth token in test.html for it to work. 

This is made for use in a client-side website, no server required. You could, for example, make a .html and package twapi.js with it, and use it with CLR browser. Or make an entire bot with it, but run off of the client's browser rather than a server. Or whatever really.
