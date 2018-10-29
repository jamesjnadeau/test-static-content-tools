var ContentTools = require('ContentTools/build/content-tools.min.js')

window.addEventListener('load', function() {
  var editor = ContentTools.EditorApp.get();
  editor.init('*[data-editable]', 'data-name');

  editor.addEventListener('saved', function (ev) {
    var name, payload, regions, xhr;

    // Check that something changed
    regions = ev.detail().regions;
    console.log(regions);
    if (Object.keys(regions).length == 0) {
        return;
    }

    // Set the editor as busy while we save our changes
    this.busy(true);

    // Collect the contents of each region into a FormData instance
    payload = {};
    for (name in regions) {
        if (regions.hasOwnProperty(name)) {
            payload[name] = regions[name];
        }
    }

    payload.path = location.pathname;

    // Debug payload
    console.log(payload);


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

    new ContentTools.FlashUI('ok');
    editor.busy(false);


    xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', onStateChange);
    xhr.open('POST', '/.netlify/functions/github');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(payload));
});


});
