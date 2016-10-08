/*
  returns true for node.js or nw.js

  Context   window  nw
  browser	  object  -
  node.js   -       -
  nw.js	    object	object
*/

module.exports = (function(){
  return (typeof window !== 'object' || typeof nw === 'object' );
})();
