'use strict';

// var ERRORS to be declared
const ERROR_REQUEST_FAILED              = 'REQUEST_FAILED';
const ERROR_UNEXPECTED_SERVER_RESPONSE  = 'UNEXPECTED_SERVER_RESPONSE';
const ERROR_MISSING_MANDATORY_ARGUMENT  = 'MISSING_MANDATORY_ARGUMENT';

const DEFAULT_BARRACKS_BASE_URL         = 'https://app.barracks.io';
const DEFAULT_BARRACKS_MQTT_ENDPOINT    = 'mqtt://app.barracks.io';

require('es6-promise').polyfill();
const responseBuilder = require('./responseBuilder');
const fs = require('fs');
const request = require('request');
const fileHelper = require('./fileHelper');
const mqtt = require('mqtt');
//const uuid = require('uuid/v1');


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
  return new Promise((resolve, reject) => {
    const mqttEndpoint = DEFAULT_BARRACKS_MQTT_ENDPOINT;
    const client = mqtt.connect(mqttEndpoint, {
      clientId: `${apiKey}.${unitId}`,
      clean: false
    });

    client.on('connect', () => {
      console.log('Connected to ' + mqttEndpoint);
      client.subscribe(`${apiKey}.${unitId}`, { qos: 2 });
    });

    client.on('message', (topic, message, packet) => {
      console.log('Received: ' + message.toString() + ' [retain=' + packet.retain + ']');
    });

    client.on('error', (error) => {
      logger.error(error);
      client.end();
      reject('Connection error:' + error);
    });

    client.on('close', () => {
      logger.debug('Connection closed');
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