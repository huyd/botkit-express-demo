'use strict';

const plugins = [
  require('./gobot.js'), 
  require('./awesome.js'), 
  require('./thirBot.js')
]
let _ = require('lodash');

module.exports = {

  //listen what can you do?, start conversation
  init: function(controller, bot, expressApp) {
      controller.hears('what can you do?', 'direct_mention,direct_message', function(bot, message) {
      // if(todoApi){
      //   console.log(todoApi);
      // todoApi.todoList.get( function(err, res ) {
      //     if(err){
      //       console.log(err);
      //     } else {
      //       console.log(res);
      //     }
      //   });
      // }
      // request.get('https://l6dp2igafd.execute-api.us-west-2.amazonaws.com/api/todo', function(error, response, body) {
      //   console.log('kjfghkdjfghkjdhkj',body);
      // });

      bot.startConversation(message, showListPlugin);
    });
  }
};

//show plugin lish 
function showListPlugin(response, convo) {
  //get list name plugins
  let array = []
  let listPlugins = '';
  for (let i = 0; i < plugins.length; i++) {
    listPlugins += ' ' + (i + 1) + '. ' + plugins[i].name + '\n';
  };

  //set form list
  let showListPlugin = {
    "attachments": [
      {
        "title": "I can do the following",
        "text": listPlugins,
        "color": "#F35A00"
      }
    ]
  }
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

