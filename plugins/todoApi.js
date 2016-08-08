var request = require('request');

module.exports = function() {

  var todo_api = {
    api_url: 'https://l6dp2igafd.execute-api.us-west-2.amazonaws.com/api/',

    // this is a simple function used to call the slack web API
    callAPI: function(method,command,options, cb) {
      if(!method){
        return err;
      } else{
        if(method == 'GET'){
          request.get(this.api_url+command+options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            cb(null, JSON.parse(body));
          } else {
            if (cb) cb(error || 'Invalid response');
          }
          });
        } else {
          request({
            url: this.api_url+command, //URL to hit
            method: method,
            json: options
          }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            cb(null, body);
          } else {
            if (cb) cb(error || 'Invalid response');
          }
         });
        }
        
      }
    },
    todoList: {
      get: function(channel, cb){
        var param = '?channel='+channel;
        todo_api.callAPI('GET','todo', param, cb);
      }
    },
    todoItem: {
      get: function(id, cb) {
        var params = '?id='+id;
        todo_api.callAPI('GET','todoitem', params, cb);
      },
      update: function(options, cb) {
        todo_api.callAPI('PUT','todoitem', options, cb)
      },
      add: function(options, cb) {
        todo_api.callAPI('POST','todo', options, cb );
      },
      del: function(options, cb){
        var params = {
          id: options 
        }
        todo_api.callAPI('DELETE','todoitem', params, cb);
      }
    }
  };

  return todo_api;


}
