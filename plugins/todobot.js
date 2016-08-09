'use strict';

var botkitChronos = require('botkit-chronos');
var todoApi = require('./todoApi.js')();
var Promise = require('bluebird');
var UID = require('node-uuid');
var async = require('async');

const validActions = {
  'list': 'Display list of todos `todo list`',
  'add': 'Add a new todo item `todo add Buy some milk`',
  'detail': 'Display detail todo `todo detail 123`',
  'setdesc': 'set description for a todo item `todo setdesc 123 At supermarket`',
  'setduedate': 'Set due date for a todo item `todo setduedate 123 monday`',
  'complete': 'Mark a todo item as completed `todo complete 123`',
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

    let msg = (message.text || '').replace('todo', '').trim();
    if (msg) {
      msg = msg.substring(msg.indexOf(' ')).trim();
    };

    let dueDate = new Date();

    if (message.text.match(/todo setduedate (.*) TS(.*)/i)) {
      dueDate = parseInt(message.text.match(/todo setduedate (.*) TS(.*)/i)[2]);
      if (dueDate) {
        msg = message.text.match(/todo setduedate (.*) TS(.*)/i)[1];
      };
    };

    function handleResponse(response) {
      bot.reply(message, response);
    }

    getListTodo(key).then(function(data){
      
      todoList[key] = data;
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
          case 'detail':
            return showDetail(key, msg).then(function(data) {
              handleResponse(data);
            }).catch(function(err) {
              handleResponse('Error');
            });
          case 'setduedate':
            return setDueDate(key, msg, dueDate).then(function(data) {
              handleResponse(data);
            }).catch(function(err) {
              handleResponse('Error');
            });
          case 'complete':
            return completeTodo(key, msg).then(function(data) {
              handleResponse(data);
            }).catch(function(err) {
              handleResponse('Error');
            });
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
    
  });
}

function getListTodo(key) {
  return new Promise((resolve, reject) => {
    if(!todoList[key]) {
      todoApi.todoList.get(key, function(err, data) {
        if (err) {
          reject(err);
        }else {
          return resolve(data);
        }
      });
    } else {
      return resolve(todoList[key]);
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
  return new Promise((resolve, reject) => {
    let message = '';
    if(!todoList[key] || !todoList[key].length) {
      message = 'You currently have an empty todo list! :smile:';
    } else {
      for( let i = 0; i < todoList[key].length; i++) {
        message += `:white_medium_square: [${i+1}] ${todoList[key][i].title}\n`;
      }
    }
    return resolve(message);
  })
};

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

      todoList[key].push(newTodo);
      return resolve(`:white_medium_square: Added todo:  ${newTodo.title}`)
    });
  });
};

//show detail todo 
function showDetail(key, message) {
  return new Promise((resolve, reject) => {
    var item = todoList[key][parseInt(message)-1];
    if(item.complete) {
      var status = "YES";
    }else {
      var status = "NO";
    }
    return resolve({
      "attachments": [
        {
          "title": item.title,
          "fields": [
            {
              "title": "Description",
              "value": item.description,
              "short": false
            },
            {
              "title": "Due Date",
              "value": (item.due_date === 'Not yet update...') ? item.due_date : new Date(item.due_date).toLocaleDateString(),
              "short": true
            },
            {
              "title": "Complete",
              "value": status,
              "short": true
            }
          ],
          "color": "#F35A00"
        }
      ]
    })
  })
};

// Set Description for a todo
function setDescripton(key, message) {
  return new Promise((resolve, reject) => {
    var indexItem = message.split(' ')[0];
    var descText = message.substring(indexItem.length+1);
    var itemUpdate = todoList[key][indexItem-1]
    var updateData = {
      id: itemUpdate.id,
      item: 'description',
      value: descText
    }
    return todoApi.todoItem.update(updateData, function(err, data) {
      if (err) {
        return reject(err);
      } else {
      todoList[key][indexItem-1].description = descText;
      return resolve('Update description: `'+descText+'` of todo'+todoList[key][indexItem-1].title+'');
      }
    });
  })
}

function setDueDate(key, message, dueDate) {
  return new Promise((resolve, reject) => {
    var itemUpdate = todoList[key][parseInt(message)-1];
    var updateData = {
      id: itemUpdate.id,
      item: 'due_date',
      value: dueDate,
    }
    return todoApi.todoItem.update(updateData, function(err, todo) {
      if (err) {
        return err;
      };
      todoList[key][parseInt(message)-1].due_date = dueDate;
      return resolve('Update dueDate: `'+new Date(dueDate).toLocaleDateString()+'` of todo '+todoList[key][parseInt(message)-1].title+'');
    });
  })
};

function completeTodo(key, message) {
  return new Promise((resolve, reject) => {
    var indexItem = message.split(' ')[0];
    var itemUpdate = todoList[key][indexItem-1]
    var updateData = {
      id: itemUpdate.id,
      item: 'complete',
      value: true,
    }
    return todoApi.todoItem.update(updateData, function(err, data) {
      if (err) {
        return reject(err);
      } else {
      todoList[key][indexItem-1].complete = true;
      return resolve('Completed: '+todoList[key][indexItem-1].title);
      }
    });
  })
};


//  Remove a todo
function removeTodo(key, message) {
  return new Promise((resolve, reject) => {
      var id = todoList[key][parseInt(message)-1].id;
      return todoApi.todoItem.del(id, function(err, removedTodo) {
        if (err) {
          return reject(err);
        };
        let tiltleRemove = todoList[key][parseInt(message)-1].title;
        todoList[key].splice(parseInt(message)-1, 1);
        return resolve('Removed todo `'+tiltleRemove+'` from your list');
      });
  })
};
