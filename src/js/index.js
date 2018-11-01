require("bootstrap/dist/js/bootstrap.js");

var Cookie = require('js-cookie');

var loadAuth = function() {
  // code split here
  require.ensure([
    'netlify-identity-widget',
    'ContentTools/build/content-tools.min.js'
  ], function(require) {
    require('./auth');
  });
};

// check if editor cookie set
if (Cookie.get('load-editor')) {
  loadAuth();
}

// check if we hold clicked banner
var pressTimer;
var semaphore = false;
$("a.navbar-brand.brand").mouseup(function() {
  clearTimeout(pressTimer);
  return false;
}).mousedown(function(event) {
  var element = event.target;
  pressTimer = window.setTimeout(function() {
    element.classList.add('infinite', 'animated', 'flash');
    semaphore = true;
  }, 4000);
  return false;
}).click(function(event) {
  var element = event.target;
  console.log('semaphore', semaphore);
  if (semaphore) {
    event.preventDefault();
    element.classList.remove('infinite', 'animated', 'flash');
    Cookie.set('load-editor', true);
    loadAuth();
  }
});
