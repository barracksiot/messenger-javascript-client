[![Build Status](https://travis-ci.org/barracksiot/messenger-javascript-client.svg?branch=BO-1117)](https://travis-ci.org/barracksiot/messenger-javascript-client) [![Coverage Status](https://coveralls.io/repos/github/barracksiot/messenger-javascript-client/badge.svg?branch=BO-1117)](https://coveralls.io/github/barracksiot/javascript-client?branch=master)

# Barracks Messaging SDK for Javascript (Beta)

The Javascript SDK to enable messaging on your devices

## Installation

```bash
$ npm install barracks-messenger-sdk-betatest
```

## Usage

### Create a Barracks Messaging SDK instance :

```js
var BarracksMessenger = require('../src/index').BarracksMessenger;

var barracksMessenger = new BarracksMessenger({
  apiKey: 'Your user API key',
  unitId: 'The unique device identifier'
});
```
Your user API key you can be found on the Account page of the [Barracks application](https://app.barracks.io/).

### Connect to the messaging service :
```js
barracksMessenger.connect({
    onConnect: function() {
      // Do something when your device connects to MQTT
    },
    onError: function(err) {
      // Do something when an error occurs
    },
    onClose: function() {
      // Do something when the connection is closed
    },
    onReconnect: function() {
      // Do somethings when the device attempts to reconnect
    }
});
```

### Subscribe to a topic to enable message reception :
```js
barracksMessenger.subscribe(topic, function(messageReceived) {
    // Do something with a message when you retrieve it
}, { qos: 1 });
```

A message object has 5 properties : 
* payload  : String
* retained : boolean
* topic    : String
* length   : int
* qos      : 0 or 1 (2 is not supported yet)

### End the connection :

```js
barracksMessenger.end();
```

## Docs & Community

* [Website and Documentation](https://barracks.io/)
* [Github Organization](https://github.com/barracksiot) for other official SDKs