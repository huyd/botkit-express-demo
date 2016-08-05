module.exports = {
  name: 'gobot',
  title: 'gobot',
  description: 'This is gobot',
  hasChoose: function(response, convo) {
    var say = {
      "attachments": [
        {
          "pretext": "you has chosen thirBot",
          "title": 'gobot',
          "text": 'This is gobot',
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
