'use strict';

// const plugins = [
//   require('./gobot.js'), 
//   require('./awesome.js'), 
//   require('./thirBot.js')
// ]
var todoApi = require('./todoApi.js')()
let _ = require('lodash');

  module.exports = {

    //listen what can you do?, start conversation
    init: function(controller, bot, expressApp) {
      controller.hears('what can you do?', 'direct_mention,direct_message', function(bot, message) {
        bot.startConversation(message, showListPlugin);
      });
    }
  };

//show plugin list 
function showListPlugin(response, convo, cb) {
  //get list name plugins
  todoApi.todoList.get(function(err, res){
    if (err) {
      cb && cb(err);
    } else {
      cb && cb(null, res);
      var plugins = res.list;
      let listPlugins = '';
      for (let i = 0; i < plugins.length; i++) {
        listPlugins += ' ' + (i + 1) + '. ' + plugins[i].name + '\n';
      };

      //set form list
      var showListPlugins = {
        "attachments": [
          {
            "title": "I can do the following",
            "text": listPlugins,
            "color": "#F35A00"
          }
        ]
      }
    }
  }) 
  console.log(showListPlugins);
  convo.say(showListPlugin);

  //listen user choose plugin
  convo.ask('Type a number to find out more about the plugin.', [
    {
      pattern: '[0-9]',
      callback: function(response, convo) {
        if (!plugins[parseInt(response.text, 10) - 1]) {
          convo.repeat();
        } else {
          plugins[parseInt(response.text, 10) - 1].hasChoose(response, convo);
        };
      }
    },
    {
      default: true,
      callback: function(response, convo) {
        convo.repeat();
        convo.next();
      }
    }
  ]);
}

