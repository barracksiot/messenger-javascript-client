'use strict';

var BarracksMessenger = require('../src/index').BarracksMessenger;
var fs = require('fs');


var args = {};
process.argv.forEach(function (val, index) {
  if (index >= 2 && index % 2 === 0) {
    var argName = val.substr(2);
    args[argName] = process.argv[index + 1];
  }
});

var barracksBaseUrl = args.baseUrl;
var barracksMqttEndpoint = args.MqttEndpoint;
var barracksApiKey = args.apiKey;

if (!barracksApiKey) {
  console.log('Argument --apiKey <API_KEY> is mandatory.');
  console.log('<API_KEY> is your user api key that you can find on the Account page of Barracks.');
  console.log('You can also use the argument --baseUrl <BARRACKS_URL> if you want to request another domain than the default one.');
  process.exit();
}

var barracksMessenger = new BarracksMessenger({
  baseURL: barracksBaseUrl,
  mqttEndpoint: barracksMqttEndpoint,
  unitId: 'Patrick',
  apiKey: barracksApiKey
});

function listenMessages() {
  barracksMessenger.connect({
    onConnect: function() {
      console.log('Connected to ' + barracksMessenger.options.mqttEndpoint);
    },
    onError: function(err) {
      console.log('Error occurred : ' + err);
    },
    onClose: function() {
      console.log('Connection closed');
    },
    onReconnect: function() {
      console.log('Attempting to reconnect...');
    }
  });

  barracksMessenger.subscribe(barracksMessenger.options.apiKey + '.' + barracksMessenger.options.unitId, function(messageReceived) {
    console.log('Received: ' + messageReceived.payload);
    console.log('retain : ' + messageReceived.retained + ' // topic : ' + messageReceived.topic);
    console.log('length: ' + messageReceived.length);
    console.log('qos ' + messageReceived.qos);
  }, { qos: 1 });

  setTimeout(function () {
    barracksMessenger.end();
  }, 120000);
}

listenMessages();
