require("bootstrap/dist/js/bootstrap.js");

var netlifyIdentity = require("netlify-identity-widget");

var loadContentTools = require('./contentTools');

netlifyIdentity.init();

var currentUser = netlifyIdentity.currentUser();

if (currentUser) {
  currentUser.jwt().then(function(accessToken) {
    loadContentTools(accessToken);
  });
} else {
  netlifyIdentity.on('login', function(user) {
    loadContentTools(user.token.access_token);
    netlifyIdentity.close();
  });

  netlifyIdentity.open('login');
}
