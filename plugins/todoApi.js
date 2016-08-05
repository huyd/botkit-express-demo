var request = require('request');


module.exports = function() {

  var todo_api = {
    api_url: 'https://l6dp2igafd.execute-api.us-west-2.amazonaws.com/api/',

    // this is a simple function used to call the slack web API
    getAPI: function(command,options, cb) {
      request.get(this.api_url+command+options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        cb(err, body);
      } else {
        if (cb) cb(error || 'Invalid response');
      }
    });
    },
    postAPI: function(command, options, cb) {
      request({
          url: this.api_url+command, //URL to hit
          method: 'POST',
          json: options
      }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        cb(body);
      } else {
        if (cb) cb(error || 'Invalid response');
      }
     });
    },
    putAPI: function(command, options, cb) {
        request.put(this.api_url+command, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(body);
        } else {
          if (cb) cb(error || 'Invalid response');
        }
      })
    },
    deleteAPI: function(command,options, cb) {
      request({
          url: this.api_url+command, //URL to hit
          method: 'DELETE',
          json: options
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(err, body);
        } else {
          if (cb) cb(error || 'Invalid response');
        }
      });
    },
    todoList: {
      get: function(cb){
        todo_api.getAPI('todo', cb);
      }
    },
    todoItem: {
      get: function(id, cb) {
        var params = '?id='+id;
        todo_api.getAPI('todoitem',params, cb);
      },
      update: function(options, cb) {
        todo_api.putAPI('todoitem',options, cb)
      },
      add: function(options, cb) {
        todo_api.postAPI('todo',options, cb );
      },
      del: function(options, cb){
        todo_api.deleteAPI('todoitem',options, cb);
      }
    }
  };

  return todo_api;


}
