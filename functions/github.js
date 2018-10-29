import Octokit from '@octokit/rest';

require('dotenv').config();

var octokit = Octokit();

// basic auth
octokit.authenticate({
  // username: process.env.GITHUB_USERNAME,
  type: 'oauth',
  token: process.env.GITHUB_OAUTH_TOKEN,
});

var updateContent = function(path, message, content, cb) {
  console.log({
    owner: process.env.GITHUB_USERNAME,
    repo: process.env.GITHUB_REPO_NAME,
    path,
  });
  try {
    octokit.repos.getContent({
      owner: process.env.GITHUB_USERNAME,
      repo: process.env.GITHUB_REPO_NAME,
      path,
    }).then(function(origContent) {
      console.log(origContent);
    /*  octokit.repos.updateFile({
        owner: process.env.GITHUB_USERNAME,
        repo: process.env.GITHUB_REPO_NAME,
        path,
        message, // The commit message
        content, // The new file content, using Base64 encoding.
        sha: origContent.sha, // The blob SHA of the file being replaced.
      }).then(function(result) {
        console.log(result);
        cb();
      });
      */
    });
  } catch (err) {
    console.error(err);
  }

};

exports.handler = function(ev, context, callback) {
  // console.log('event', ev);
  // console.log('context', context);

  var body = JSON.parse(ev.body);
  console.log('body', body);

  var path = '/content' + body.path + 'index.html';

  updateContent(path, function() {
    callback(null, {
      // "isBase64Encoded": false,
      statusCode: 200,
      // "headers": { "headerName": "headerValue", ... },
      body: "OK",
    });
  });

};
