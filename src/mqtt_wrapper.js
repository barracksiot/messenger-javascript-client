var mqtt = require('mqtt');

module.exports = {
  on : function(client, event, callback) {
    return new Promise(function(resolve, reject) {
      client.on(event, callback);
    });
  }
};

