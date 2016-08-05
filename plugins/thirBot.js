module.exports = {
  name: 'thirBot',
  title: 'thirBot',
  description: 'This is thirBot',

  //function start plugin
  hasChoose: function(response, convo) {

    var say = {
      "attachments": [
        {
          "pretext": "you has chosen thirBot",
          "title": 'thirBot',
          "text": 'This is thirBot',
          "mrkdwn_in": [
            "text",
            "pretext"        
          ],
          "color": "#F35A00"
        }
      ]
    }
    convo.say(say);
    convo.next();
  }
};
