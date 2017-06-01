'use strict';

var DEFAULT_BARRACKS_BASE_URL         = 'https://app.barracks.io';
var DEFAULT_BARRACKS_MQTT_ENDPOINT    = 'mqtt://app.barracks.io';

require('es6-promise').polyfill();
var fs = require('fs');
var request = require('request');
var mqtt = require('mqtt');
var MqttWrapper = require('../src/mqtt_wrapper');
var uuid = require('uuid/v1');

function Barracks(options) {
  this.options = {
    baseURL: options.baseURL || DEFAULT_BARRACKS_BASE_URL,
    apiKey: options.apiKey
  };

  if (options.allowSelfSigned && options.allowSelfSigned === true) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

// A very useful comment
Barracks.prototype.listenMessages = function (apiKey, unitId, timeout) {
  return new Promise(function (resolve, reject){
    var mqttEndpoint = 'mqtt://192.168.99.100';
    var client = mqtt.connect(mqttEndpoint, {
      clientId: apiKey + '.' + unitId,
      clean: false
    });

    MqttWrapper.on(client, 'connect', function() {
      console.log('Connected to ' + mqttEndpoint);
      client.subscribe(apiKey + '.' + unitId, { qos: 1 });
      console.log('subscribed to ' + apiKey + '.' + unitId );
    });

    MqttWrapper.on(client, 'message', function(topic, message, packet) {
      console.log('Received: ' + message.toString() + ' [retain=' + packet.retain + ']');
    });

    MqttWrapper.on(client, 'error', function(error) {
      console.log(error);
      client.end();
      reject('Connection error:' + error);
    });

    MqttWrapper.on(client, 'close', function() {
      console.log('Connection closed');
      resolve();
    });

   /* if (timeout) {
      setTimeout(function () {
        client.end();
        resolve();
      }, timeout);
    }*/
  });
};

module.exports = Barracks;