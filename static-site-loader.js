var pathUtil = require('path');
var marked = require('marked');
var jade = require('jade');
var RSS = require('rss');
var version = require('package')(__dirname).version;
var fs = require('fs');

var notJadeContent = [];
var template;
var feedURLs;

var feedOptions = {
  title: 'James\' Today I ... ',
  description: 'A collection of things I found interesting at the time.',
  site_url: 'https://jamesjnadeau.com',
};

var menu = fs.readFileSync('./meta/menu.html');

module.exports = {
  // perform any preprocessing tasks you might need here.
  preProcess: function(source, path) { // source
    // watch the content directory for changes
    this.addContextDependency(path);
    // Define our template path
    var templatePath = 'templates/default.jade';
    // watch the template for changes
    this.addDependency(templatePath);
    // Compile the template for use later
    template = jade.compileFile(templatePath, { pretty: false });
    // clear out shared vars for new run
    notJadeContent = [];
    feedURLs = [];
  },
  // Test if a file should be processed or not, should return true or false;
  testToInclude: function(path) { // stats, absPath
    return pathUtil.extname(path) !== '.js';
  },
  // allows you to rewrite the url path that this will be uploaded to
  rewriteUrlPath: function(path, stats, absPath) {
    var extensionSize = pathUtil.extname(path).length;
    this.addDependency(absPath);

    var urlPath = path;
    if (extensionSize) {
      // strip out the extension
      urlPath = path.slice(0, extensionSize * -1);
    }

    // rewrite /index to be just /, making index.html files become the folder index properly
    urlPath = urlPath.replace('index', '');

    return urlPath;
  },

  processFile: function(file, content, callback) {
    // use compiled template to produce html file
    var fileContents = template({
      title: '',
      description: '',
      menu,
      content,
      version,
    });

    callback(fileContents);
  },

  postProcess: function() { // files
    // Create TIL rss feed
    /* var feed = new RSS(feedOptions);
    feedURLs.forEach(function(url) {
      var urlParts = url.split('-');
      var date = urlParts.slice(0, 3).join('-');
      var name = urlParts.slice(3).join(' ');
      // upper case first letter
      name = name.charAt(0).toUpperCase() + name.slice(1);
      feed.item({
        date: new Date(date),
        title: name,
        url: 'https://jamesjnadeau.com/' + url + '/index.html',
      });
    });
    var feedXml = feed.xml({ indent: true });
    this.emitFile('TIL/rss.xml', feedXml);
    */
  },
};
