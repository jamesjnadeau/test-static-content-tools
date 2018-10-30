import Octokit from '@octokit/rest';

require('dotenv').config();

var octokit = Octokit();

// basic auth
octokit.authenticate({
  // username: process.env.GITHUB_USERNAME,
  type: 'oauth',
  token: process.env.GITHUB_OAUTH_TOKEN,
});

var handleError = function(err) {
  console.error(err);
};

var updateContent = function(path, message, content, cb) {
  console.log({
    path,
    message,
    content
  });
  try {
    octokit.repos.getContent({
      owner: process.env.GITHUB_USERNAME,
      repo: process.env.GITHUB_REPO_NAME,
      path,
    }).then(function(origContent) {
      // console.log(origContent);
      octokit.repos.updateFile({
        owner: process.env.GITHUB_USERNAME,
        repo: process.env.GITHUB_REPO_NAME,
        path,
        message, // The commit message
        content, // The new file content, using Base64 encoding.
        sha: origContent.data.sha, // The blob SHA of the file being replaced.
      }).then(function(result) {
        console.log(result);
        cb();
      }).catch(handleError);
    }).catch(handleError);
  } catch (err) {
    console.error(err);
  }

};

exports.handler = function(ev, context, callback) {

  if (!context || !context.clientContext || !context.clientContext.user) {
    return callback(new Error('Not Authenticated'));
  }

  var body = JSON.parse(ev.body);
  console.log('body', body);

  var path = 'content' + body.path + 'index.html';
  var message = body.message || 'Test commit message';
  var content = Buffer.from(body.content).toString('base64');

  updateContent(path, message, content, function() {
    callback(null, {
      // "isBase64Encoded": false,
      statusCode: 200,
      // "headers": { "headerName": "headerValue", ... },
      body: "OK",
    });
  });

};
