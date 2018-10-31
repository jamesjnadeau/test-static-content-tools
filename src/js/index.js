require("bootstrap/dist/js/bootstrap.js");

var netlifyIdentity = require("netlify-identity-widget");

var loadContentTools = require('./contentTools');

netlifyIdentity.init();

var currentUser = netlifyIdentity.currentUser();
console.log('user', currentUser);
if (currentUser) {
  currentUser.jwt().then(function(accessToken) {
    loadContentTools(accessToken);
  });
} else {
  netlifyIdentity.on('login', function(user) {
    netlifyIdentity.close();
    loadContentTools(user.token.access_token);
  });

  netlifyIdentity.open('login');
}
