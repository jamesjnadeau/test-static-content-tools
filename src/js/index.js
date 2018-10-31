require("bootstrap/dist/js/bootstrap.js");
var loadContentTools = require('./ContentTools');

var currentUser = netlifyIdentity.currentUser();

if (currentUser) {
  currentUser.jwt().then(function(accessToken) {
    loadContentTools(accessToken)
  });
} else {
  netlifyIdentity.on('login', function(user) {
    getPrivateContent(user.token.access_token);
    netlifyIdentity.close();
  });

  netlifyIdentity.open('login');
}
