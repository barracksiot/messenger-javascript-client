'use strict';

var DEFAULT_BARRACKS_BASE_URL         = 'https://app.barracks.io';
var DEFAULT_BARRACKS_MQTT_ENDPOINT    = 'mqtt://app.barracks.io';

require('es6-promise').polyfill();
var fs = require('fs');
var request = require('request');
var mqtt = require('mqtt');
var uuid = require('uuid/v1');
var client;

function BarracksMessenger(options) {
  this.options = {
    baseURL: options.baseURL || DEFAULT_BARRACKS_BASE_URL,
    mqttEndpoint: options.mqttEndpoint || DEFAULT_BARRACKS_MQTT_ENDPOINT,
    unitId: options.unitId,
    apiKey: options.apiKey
  };
}

function Message(payload, retained, topic, length, qos) {
  this.payload = payload;
  this.retained = retained;
  this.topic = topic;
  this.length = length;
  this.qos = qos;
};

BarracksMessenger.prototype.connect = function(options) {
  client = mqtt.connect(this.options.mqttEndpoint, {
    clientId: this.options.apiKey + '.' + this.options.unitId,
    clean: false
  });

  client.on('connect', options.onConnect);
  client.on('error', options.onError);
  client.on('close', options.onClose);
  client.on('reconnect', options.onReconnect);
};

BarracksMessenger.prototype.subscribe = function(topic, callback, options) {
  client.subscribe(topic, { qos: options.qos });
  client.on('message', function(topic, message, packet) {
    var messageReceived = new Message(message.toString(), packet.retain, packet.topic, packet.length, packet.qos);
    callback(messageReceived);
  });
};

BarracksMessenger.prototype.end = function() {
  client.end();
  console.log('Disconnected from server');
};

module.exports.BarracksMessenger = BarracksMessenger;
module.exports.Message = Message;