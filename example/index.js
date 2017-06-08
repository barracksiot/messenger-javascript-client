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
var barracksMqttEndpoint = args.mqttEndpoint;
var barracksApiKey = args.apiKey;
var barracksUnitId = args.unitId;

function usage() {
  console.log('You can also use the arguments --baseUrl <BARRACKS_URL> and --mqttEndpoint <MQTT_ENDPOINT> if you want to request another domain than the default one.');
  process.exit();
}

if (!barracksApiKey) {
  console.log('Argument --apiKey <API_KEY> is mandatory.');
  console.log('<API_KEY> is your user api key that you can find on the Account page of Barracks.');
  usage();
}

if (!barracksUnitId) {
  console.log('Argument --unitId <UNIT_ID> is mandatory.');
  console.log('<UNIT_ID> is your device\'s id');
  usage();
}

var barracksMessenger = new BarracksMessenger({
  baseURL: barracksBaseUrl,
  mqttEndpoint: barracksMqttEndpoint,
  unitId: barracksUnitId,
  apiKey: barracksApiKey
});

function listenMessages() {
  barracksMessenger.connect({
    onConnect: function () {
      console.log('Connected to ' + barracksMqttEndpoint);
    },
    onError: function (err) {
      console.log('Error occurred : ' + err);
    },
    onClose: function () {
      console.log('Connection closed');
    },
    onReconnect: function () {
      console.log('Attempting to reconnect...');
    }
  });

  barracksMessenger.subscribe(barracksApiKey + '.' + barracksUnitId, function (messageReceived) {
    console.log('Received: ' + messageReceived.payload);
    console.log('retain : ' + messageReceived.retained);
    console.log('topic : ' + messageReceived.topic);
    console.log('length: ' + messageReceived.length);
    console.log('qos ' + messageReceived.qos);
  }, { qos: 1 });

  setTimeout(function () {
    barracksMessenger.end();
  }, 120000);
}

listenMessages();
