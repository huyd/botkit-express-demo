'use strict';

var botkitChronos = require('botkit-chronos');
var todoApi = require('./todoApi.js')();
var Promise = require('bluebird');
var UID = require('node-uuid');
var async = require('async');

const validActions = {
  'list': 'Display list of todos `todo list`',
  'add': 'Add a new todo item `todo add Buy some milk`',
  'setdesc': 'set description for a todo item `todo setdesc 123 At supermarket`',
  'setduedate': 'Set due date for a todo item `todo setduedate 123 monday`',
  'complete': 'Mark a todo item as completed `todo completed 123`',
  'remove': 'Remove a todo item `todo remove 123`',
  'help': 'Show this help text `todo help`'
};

var todoList = [];

module.exports = {
  init: function(controller, bot, expressApp) {
    botkitChronos.use(controller);
    addListeners(controller, bot);
  }
};

function addListeners(controller, bot) {

  controller.hears('todo', 'direct_mention,direct_message,mention', function(bot, message) {
    let action = message.text.split(' ')[1];
    if (action) {
      action = action.trim().toLowerCase();
    };


    let key = message.channel;

    if (!todoList[key]) {
      todoList[key] = [];
      getListTodo(key);
    };

    let msg = (message.text || '').replace('todo', '').trim();
    if (msg) {
      msg = msg.substring(msg.indexOf(' ')).trim();
    };

    // let dueDate = parseInt(message.text.match(/todo setduedate (.*) TS(.*)/i)[2]);
    // if (dueDate) {
    //   msg = message.text.match(/todo setduedate (.*) TS(.*)/i)[1];
    // };

    function handleResponse(response) {
      bot.reply(message, response);
    }

    if(validActions.hasOwnProperty(action)) {
      switch(action) {
        case 'help':
          return handleResponse(showHelp());
        case 'list':
          return showList(key).then(function(data) {
            handleResponse(data);
          }).catch(function(err) {
            handleResponse('Error');
          });
        case 'add':
          return addTodo(key, msg).then(function(data) {
            handleResponse(data);
          }).catch(function(err) {
            handleResponse('Error');
          });
        case 'setdesc':
          return setDescripton(key, msg).then(function(data) {
            handleResponse(data);
          }).catch(function(err) {
            handleResponse('Error');
          });
        // case 'setduedate':
        //   return handleResponse(setDueDate(key, msg, dueDate));
        case 'complete':
          return handleResponse(completeTodo(key, msg));
        case 'remove':
          return removeTodo(key, msg).then(function(data){
            handleResponse(data);
          }).catch(function(err) {
            handleResponse('Error');
          })
      }
    } else {
      return handleResponse(showHelp(true));
    }
  });
}

function getListTodo(key) {
  todoApi.todoList.get(key, function(err, data) {
    if (!err) {
      todoList[key] = data;
    }
  });
}


function showHelp(unknownCommand) {
  let helpMessage = ``;
  if(unknownCommand) {
    helpMessage += "I don't understand what you mean.\n\n";
  }

  for(let validAction in validActions) {
    helpMessage += `*${validAction}:* ${validActions[validAction]}\n`
  }

  return helpMessage;
}

// Show list todos
function showList(key) {
  if (!todoList[key]) {
    todoList[key] = [];
  };
  return new Promise((resolve, reject) => {
    
    let message = '';
    
    if(!todoList[key] || !todoList[key].length) {
      message = 'You currently have an empty todo list! :smile:';
    } else {
      for( let i = 0; i < todoList[key].length; i++) {
        message += `:white_medium_square: [${i+1}] ${todoList[i].title}\n`;
      }
    }
    return resolve(message);
};

function showDetail(key){
  return new Promise((resolve, reject) => {

  });
}

// Add new todo
function addTodo(key, message) {
  return new Promise((resolve, reject) => {
    var item = {
      id: UID.v4(),
      channel: key,
      title: message
    }
    return todoApi.todoItem.add(item, function(err, newTodo) {
      if (err) {
        return reject(err);
      };

      todoList.push(item);
      return resolve(`:white_medium_square: Added todo:  ${newTodo.title}`)
    });
  });
};

// Set Description for a todo
function setDescripton(key, message) {
  return new Promise((resolve, reject) => {
    async.waterfall([
      function (callback) {
        if(!todoList.length){
          todoApi.todoList.get(key, function(err, data) {
            if (err) {
              callback(err);
            } else {
              todoList = data;
              callback();
            }
          });
        } else {
          callback();
        }
      }
    ], function(err) {
      if (err) {
        return reject(err);
      };
      var indexItem = message.split(' ')[0];
      var descText = message.substring(indexItem.length+1);
      var itemUpdate = todoList[indexItem-1]
      var updateData = {
        id: itemUpdate.id,
        title: itemUpdate.title,
        description: descText,
        due_date: itemUpdate.duedate || "",
        complete: itemUpdate.complete || false
      }
      return todoApi.todoItem.update(updateData, function(err, data) {
        if (err) {
          return reject(err);
        };
        todoList[indexItem] = updateData;
        return resolve('Update description: `'+descText+'` of '+itemUpdate.title+'');
      });
    })
  })
}

function setDueDate(key, message, dueDate) {
  return todoApi.todoList.setDueDate(key, message, dueDate, function(err, todo) {
    if (err) {
      return err;
    };

    return '';
  });
};

function completeTodo(key, todoId) {
  return todoApi.todoList.completeTodo(key, todoId, function(err, completedTodo) {
    if (err) {
      return err;
    };
    return `:ballot_box_with_check: [${completedTodo.id}] ${completedTodo.title}\n`
  });
};


//  Remove a todo
function removeTodo(key, message) {
  return new Promise((resolve, reject) => {
    async.waterfall([
      function (callback) {
        if(!todoList.length){
          todoApi.todoList.get(key, function(err, data) {
            if (err) {
              callback(err);
            } else {
              todoList = data;
              callback();
            }
          });
        } else {
          callback();
        }
      }
    ], function(err) {
      if (err) {
        return reject(err);
      };
      var id = todoList[parseInt(message)-1].id;
      return todoApi.todoItem.del(id, function(err, removedTodo) {
        if (err) {
          return reject(err);
        };
        let tiltleRemove = todoList[parseInt(message)-1].title;
        todoList.splice(parseInt(message)-1, 1);
        return resolve('Removed todo `'+tiltleRemove+'` from your list');
      });
    })
  })
};
