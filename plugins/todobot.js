'use strict';

var botkitChronos = require('botkit-chronos');
var todoApi = require('./todoApi.js')()

const validActions = {
  'list': 'Display list of todos `todo list`',
  'add': 'Add a new todo item `todo add Buy some milk`',
  'setduedate': 'Set the due date a todo item `todo setduedate 123 monday`',
  'complete': 'Mark a todo item as complete `todo complete 123`',
  'remove': 'Remove a todo item `todo remove 123`',
  'help': 'Show this help text `todo help`'
};

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

    if(validActions.hasOwnProperty(action)) {
      switch(action) {
        case 'help':
          return handleResponse(showHelp());
        case 'list':
          return handleResponse(showList(key));
        case 'add':
          return handleResponse(addTodo(key, msg));
        case 'setduedate':
          return handleResponse(setDueDate(key, msg, dueDate));
        case 'complete':
          return handleResponse(completeTodo(key, msg));
        case 'remove':
          return handleResponse(removeTodo(key, msg))
      }
    } else {
      return handleResponse(showHelp(true));
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

function showList(key) {
  return todoApi.todoList.get(key, function(err, todoList) {
    if (err) {
      return err;
    };

    let message = '';

    if(!todoList || !todoList.length) {
      message = 'You currently have an empty todo list! :smile:';
    } else {
      for(let todo of todoList) {
        message += `:white_medium_square: [${todo.id}] ${todo.title}\n`;
      }
    }

    return message;
  });
};

function addTodo(key, message) {
  return todoApi.todoList.addTodo(key, message, function(err, newTodo) {
    if (err) {
      return err;
    };

    return `:white_medium_square: [${newTodo.id}] ${newTodo.title}`
  });
};

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

function removeTodo(key, todoId) {
  return todoApi.todoList.removeTodo(key, todoId, function(err, removedTodo) {
    if (err) {
      return err;
    };
    return 'Removed todo from your list';
  });
};
