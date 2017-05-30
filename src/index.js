'use strict';

// var ERRORS to be declared
var ERROR_REQUEST_FAILED              = 'REQUEST_FAILED';
var ERROR_UNEXPECTED_SERVER_RESPONSE  = 'UNEXPECTED_SERVER_RESPONSE';
var ERROR_MISSING_MANDATORY_ARGUMENT  = 'MISSING_MANDATORY_ARGUMENT';

var DEFAULT_BARRACKS_BASE_URL         = 'https://app.barracks.io';
var DEFAULT_BARRACKS_MQTT_ENDPOINT    = 'mqtt://app.barracks.io';

require('es6-promise').polyfill();
var fs = require('fs');
var request = require('request');
var mqtt = require('mqtt');
var uuid = require('uuid/v1');


// package.json is empty for now
function Barracks(options) {
  this.options = {
    baseURL: options.baseURL || DEFAULT_BARRACKS_BASE_URL,
    apiKey: options.apiKey
  };

  if (options.allowSelfSigned && options.allowSelfSigned === true) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

Barracks.prototype.listenMessages = function (apiKey, unitId, timeout) {
  return new Promise(function (resolve, reject){
    var mqttEndpoint = DEFAULT_BARRACKS_MQTT_ENDPOINT;
    var client = mqtt.connect(mqttEndpoint, {
      clientId: apiKey + '.' + unitId,
      clean: false
    });

    client.on('connect', function() {
      console.log('Connected to ' + mqttEndpoint);
      client.subscribe(apiKey + '.' + unitId, { qos: 2 });
    });

    client.on('message', function(topic, message, packet) {
      console.log('Received: ' + message.toString() + ' [retain=' + packet.retain + ']');
    });

    client.on('error', function(error) {
      console.log(error);
      client.end();
      reject('Connection error:' + error);
    });

    client.on('close', function() {
      console.log('Connection closed');
      resolve();
    });

    if (timeout) {
      setTimeout(function () {
        client.end();
        resolve();
      }, timeout);
    }
  });
};

module.exports = Barracks;