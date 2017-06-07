/* jshint expr: true, maxstatements: 100 */
/* global describe, it, beforeEach */
'use strict';

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;
var proxyquire = require('proxyquire').noCallThru();
var Connection = require('mqtt-connection');
var Stream = require('stream');
var BarracksMessenger = require('../src/index.js').BarracksMessenger;
var Message = require('../src/index.js').Message;

chai.use(sinonChai);

var UNIT_ID = 'unit1';
var API_KEY = 'validKey';

describe('Constructor : ', function () {

  beforeEach(function() {
    BarracksMessenger = require('../src/index.js').BarracksMessenger;
  });

  function validateBarracksMessengerObject(barracksMessenger, expectedBaseUrl, expectedMqttEndpoint) {
    expect(barracksMessenger).to.be.an('object');
    expect(barracksMessenger.options).to.be.an('object');
    expect(barracksMessenger.connect).to.be.a('function');
    expect(barracksMessenger.subscribe).to.be.a('function');
    expect(barracksMessenger.end).to.be.a('function');

    expect(barracksMessenger.options).to.deep.equals({
      baseURL: expectedBaseUrl,
      mqttEndpoint: expectedMqttEndpoint,
      unitId: UNIT_ID,
      apiKey: API_KEY
    });
  }

  it('Should return the BarracksMessenger object with default values when minimum options given', function() {
    // Given
    var options = {
      apiKey: API_KEY,
      unitId: UNIT_ID
    };

    // When
    var barracksMessenger = new BarracksMessenger(options);

    // Then
    validateBarracksMessengerObject(barracksMessenger, 'https://app.barracks.io', 'mqtt://app.barracks.io');
  });

  it('Should return the BarracksMessenger object with baseUrl overriden when url option given', function() {
    // Given
    var url = 'not.barracks.io';
    var options = {
      apiKey: API_KEY,
      unitId: UNIT_ID,
      baseURL: url
    };

    // When
    var barracksMessenger = new BarracksMessenger(options);

    // Then
    validateBarracksMessengerObject(barracksMessenger, url, 'mqtt://app.barracks.io');
  });

  it('Should return the BarracksMessenger object with mqttEndpoint overriden when mqtt option given', function() {
    // Given
    var mqttEndpoint = 'mqtt://not.barracks.io';
    var options = {
      apiKey: API_KEY,
      unitId: UNIT_ID,
      mqttEndpoint: mqttEndpoint
    };

    // When
    var barracksMessenger = new BarracksMessenger(options);

    // Then
    validateBarracksMessengerObject(barracksMessenger, 'https://app.barracks.io', mqttEndpoint);
  });
});

describe('connect', function() {

  var barracksMessenger;
  var BarracksMessenger;
  var spyOnConnect;
  var spyOnError;
  var spyOnClose;
  var spyOnReconnect;
  var mockStream = new Stream();
  var connection = new Connection(mockStream);
  var Mqtt = require('mqtt');
  Mqtt.connect = sinon.stub().returns(connection);

  beforeEach(function() {
    mockStream = new Stream();
    connection = new Connection(mockStream);
    Mqtt = require('mqtt');
    Mqtt.connect = sinon.stub().returns(connection);

    BarracksMessenger = proxyquire('../src/index.js', {
      'mqtt-connection': connection
    });

    barracksMessenger = new BarracksMessenger.BarracksMessenger({
      apiKey: 'apiKey',
      unitId: 'unitId'
    });
  });

  it('should connect and close connection properly', function(done) {
    // Given
    spyOnConnect = sinon.spy();
    spyOnClose = sinon.spy();

    setTimeout(function() {
      connection.emit('connect');
    }, 50);
    setTimeout(function() {
      connection.emit('close');
      expect(spyOnConnect).to.have.been.calledOnce;
      expect(spyOnConnect).to.have.been.calledWithExactly();
      expect(spyOnClose).to.have.been.calledOnce;
      expect(spyOnClose).to.have.been.calledWithExactly();
      done();
    }, 150);

    var apiKey = 'apiKey';
    var unitId = 'unitId';

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: function() {},
      onClose: spyOnClose,
      onReconnect: function() {}
    });
  });

  it('should go into error code if error triggered', function(done) {
    // Given
    spyOnError = sinon.spy();
    var error = 'an error';
    setTimeout(function() {
      connection.emit('error', error);
      expect(spyOnError).to.have.been.calledOnce;
      expect(spyOnError).to.have.been.calledWithExactly(error);
      done();
    }, 50);

    var apiKey = 'apiKey';
    var unitId = 'unitId';

    // When / Then
    barracksMessenger.connect({
      onConnect: function() {},
      onError: spyOnError,
      onClose: function() {},
      onReconnect: function() {}
    });
  });

  it('should attempt to reconnect if reconnect event triggered', function(done) {
    // Given
    spyOnReconnect = sinon.spy();
    var error = 'an error';
    setTimeout(function() {
      connection.emit('reconnect');
      expect(spyOnReconnect).to.have.been.calledOnce;
      expect(spyOnReconnect).to.have.been.calledWithExactly();
      done();
    }, 50);

    var apiKey = 'apiKey';
    var unitId = 'unitId';

    // When / Then
    barracksMessenger.connect({
      onConnect: function() {},
      onError: function() {},
      onClose: function() {},
      onReconnect: spyOnReconnect
    });
  });
});

describe('subscribe', function() {
  var barracksMessenger;
  var BarracksMessenger;
  var spyOnConnect;
  var spyOnError;
  var spyOnClose;
  var spyOnReconnect;
  var spyOnSubscribe;
  var spyOnMessage;
  var mockStream = new Stream();
  var connection = new Connection(mockStream);
  var Mqtt = require('mqtt');
  var Packet = require('mqtt-packet');
  Mqtt.connect = sinon.stub().returns(connection);

  beforeEach(function() {
    mockStream = new Stream();
    connection = new Connection(mockStream);
    Mqtt = require('mqtt');
    Mqtt.connect = sinon.stub().returns(connection);

    BarracksMessenger = proxyquire('../src/index.js', {
      'mqtt-connection': connection
    });

    barracksMessenger = new BarracksMessenger.BarracksMessenger({
      apiKey: 'apiKey',
      unitId: 'unitId'
    });
  });

  it('should subscribe to the topic and call the provided function', function(done) {
    // Given
    spyOnSubscribe = sinon.spy();
    spyOnConnect = sinon.spy();
    spyOnMessage = sinon.spy();
    spyOnError = sinon.spy();
    spyOnReconnect = sinon.spy();
    spyOnClose = sinon.spy();
    var topic = barracksMessenger.options.apiKey + '.' + barracksMessenger.options.unitId;
    var message = 'Salut';
    var object = {
      cmd: 'publish',
      messageId: 1,
      retain: false,
      qos: 1,
      dup: false,
      length: 10,
      topic: topic,
      payload: message
    };

    var packet = Packet.generate(object);
    var messageReceived = new Message(message.toString(), packet.retain, packet.topic, packet.length, packet.qos);

    setTimeout(function() {
      connection.emit('connect');
    }, 50);

    setTim(function() {
      connection.emit('message', topic, message, packet);
      expect(spyOnSubscribe).to.have.been.calledOnce;
      expect(spyOnSubscribe).to.have.been.calledWithExactly(messageReceived);
      expect(spyOnConnect).to.have.been.calledOnce;
      done();
    }, 100);

    connection.subscribe = sinon.stub().returns(true);

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: spyOnError,
      onClose: spyOnClose,
      onReconnect: spyOnReconnect
    });

    barracksMessenger.subscribe(topic, spyOnSubscribe, { qos: 1 });
  });
});

describe('end', function() {
  var barracksMessenger;
  var BarracksMessenger;
  var mockStream = new Stream();
  var connection = new Connection(mockStream);
  var Mqtt = require('mqtt');
  Mqtt.connect = sinon.stub().returns(connection);

  beforeEach(function() {
    mockStream = new Stream();
    connection = new Connection(mockStream);
    Mqtt = require('mqtt');
    Mqtt.connect = sinon.stub().returns(connection);

    BarracksMessenger = proxyquire('../src/index.js', {
      'mqtt-connection': connection
    });

    barracksMessenger = new BarracksMessenger.BarracksMessenger({
      apiKey: 'apiKey',
      unitId: 'unitId'
    });
  });

  it('should close the connection', function(done) {
    // Given
    setTimeout(function() {
      barracksMessenger.end();
      done();
    }, 100);

    // When / Then
    barracksMessenger.connect({
      onConnect: function(){},
      onError: function(){},
      onClose: function(){},
      onReconnect: function(){}
    });

  });
});

