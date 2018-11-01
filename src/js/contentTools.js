var ContentTools = require('ContentTools/build/content-tools.min.js');

module.exports = function(accessToken) {
  var handleError = function(xhr, status, error) {
    console.error(xhr, status, error);
  };

  var updateContent = function(path, message, content, cb) {
    var url = '/.netlify/git/github/contents/' + path;
    var headers = {
      Authorization: 'Bearer ' + accessToken,
    };
    $.ajax({
      url: url,
      headers: headers,
    }).always(function(origContent) {
      var data = {
        message: message,
        content: btoa(content), // eslint-disable-line
      };
      if (origContent) {
        data.sha = origContent.sha;
      }
      $.ajax({
        url: url,
        headers: headers,
        type: 'PUT',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
      }).then(function(result) {
        // TODO deal with error cases
        cb();
      }).fail(handleError);
      // console.log(origContent);
    }).fail(handleError);
  };

  var editor = ContentTools.EditorApp.get();
  editor.init('*[data-editable]', 'data-name');

  editor.addEventListener('saved', function(ev) {
    var payload;
    var regions;
    var xhr;

    // Check that something changed
    regions = ev.detail().regions;
    console.log(regions);
    if (Object.keys(regions).length === 0) {
      return;
    }

    // Set the editor as busy while we save our changes
    this.busy(true);

    // Collect the contents of each region into a FormData instance
    payload = {};
    var keys = Object.keys(regions);
    keys.forEach(function(name) {
      payload[name] = regions[name];
    });

    var myPath = window.location.pathname;
    payload.path = 'content' + myPath;
    if (myPath[myPath.length - 1] === '/') { // if last char is a '/'
      payload.path += 'index';
    }
    payload.path += '.html';

    // Debug payload
    console.log(payload);


    updateContent(payload.path, 'Test JS based commit', payload.content, function() {
      editor.busy(false);
      new ContentTools.FlashUI('ok');
    });

    /*
    // Send the update content to the server to be saved
    function onStateChange(ev) {
        // Check if the request is finished
        if (ev.target.readyState == 4) {
            editor.busy(false);
            if (ev.target.status == '200') {
                // Save was successful, notify the user with a flash
                new ContentTools.FlashUI('ok');
            } else {
                // Save failed, notify the user with a flash
                new ContentTools.FlashUI('no');
            }
        }
    };

    xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', onStateChange);
    xhr.open('POST', '/.netlify/git/github/contents/');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(payload));
    */
  });
};
