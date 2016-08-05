module.exports = {
  name: 'awesome',
  title: 'awesome',
  description: 'This is awesome',

  //function start plugin
  hasChoose: function(response, convo) {
    var say = {
      "attachments": [
        {
          "pretext": "you has chosen thirBot",
          "title": 'awesome',
          "text": 'This is awesome',
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
