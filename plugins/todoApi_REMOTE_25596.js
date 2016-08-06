var request = require('request');

module.exports = function() {

  var todo_api = {
    api_url: 'https://l6dp2igafd.execute-api.us-west-2.amazonaws.com/api/',

    // this is a simple function used to call the slack web API
    callAPI: function(command,options, cb) {
      // bot.log('** API CALL: ' + todo_api.todo_url + command);

      // bot.debug(command, options);

      request.get(this.api_url + command, function(error, response, body) {
        // bot.debug('Got response', error, body);
        if (!error && response.statusCode == 200) {
          var json;
          try {
            json = JSON.parse(body);
          } catch (err) {
            if (cb) return cb(err || 'Invalid JSON');
            return;
          }

          if (json.ok) {
            if (cb) cb(null, json);
          } else {
            if (cb) cb(json.error, json);
          }
        } else {
          if (cb) cb(error || 'Invalid response');
        }
      }).form(options);
    },

    todoList: {
    	get: function(key, cb){
    		todo_api.callAPI('todo', cb);
    	}
    }

  };

  return todo_api;


}
