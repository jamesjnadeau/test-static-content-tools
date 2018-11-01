var express = require('express');
var bodyParser = require('body-parser');
var sha1File = require('sha1-file');
var pathUtil = require('path');
var fs = require('fs-extra');
var jade = require('jade');
var version = require('package')(__dirname).version;


var app = express();
app.set('view engine', 'jade');

app.use(bodyParser.json({
  limit: '5mb',
}));

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

/* var plugins = [
  // OccurrenceOrderPlugin is needed for webpack 1.x only
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  // Use NoErrorsPlugin for webpack 1.x
  new webpack.NoEmitOnErrorsPlugin()
];

webpackConfig.plugins = plugins.concat(webpackConfig.plugins);
webpackConfig.entry['webpack-hot-middleware/client'] = 'webpack-hot-middleware/client';
*/
var compiler = webpack(webpackConfig);

app.use(require("webpack-dev-middleware")(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}));

// app.use(require("webpack-hot-middleware")(compiler));


app.get('/.netlify/git/github/contents/:path([^$]+)', function(req, res, next) {
  var filePath = pathUtil.join(__dirname, req.params.path);
  // console.log('filePath', filePath);
  res.send({
    sha: sha1File(filePath),
  });
});

app.put('/.netlify/git/github/contents/:path([^$]+)', function(req, res, next) {
  var filePath = pathUtil.join(__dirname, req.params.path);
  // console.log('filePath', filePath);
  console.log('body', req.body);
  const data = new Uint8Array(Buffer.from(req.body.content, 'base64'));
  fs.outputFile(filePath, data, function(err) {
    if (err) return next(err);
    res.send('ok');
  });
});


// The Rest must be last

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  /* var err = new Error('Not Found');
  err.status = 404;
  next(err);
  */
  res.status(404);

  // Define our template path
  var templatePath = 'templates/default.jade';
  // Compile the template for use later
  var template = jade.compileFile(templatePath, { pretty: false });
  var menu = fs.readFileSync('./meta/menu.html');
  var content = fs.readFileSync('./content/404.html');

  var fileContents = template({
    title: '',
    description: '',
    menu,
    content,
    version,
  });

  res.send(fileContents);
});

// Final error handler
app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(err.status || 500);
  console.error(err);

  res.format({
    'application/json': function() {
      res.json(err);
    },

    'text/html': function() {
      // Probably render a nice error page here?
      /* return res.render('error', {
        error: err
      }); */
      res.send(err.message);
    },

    'text/plain': function() {
      res.send(err.message);
    },
  });
});

var listener = app.listen(process.env.PORT || 8080, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
