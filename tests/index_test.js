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
    validateBarracksMessengerObject(barracksMessenger, 'https://app.barracks.io', 'mqtt://mqtt.barracks.io');
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
    validateBarracksMessengerObject(barracksMessenger, url, 'mqtt://mqtt.barracks.io');
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
    spyOnError = sinon.spy();
    spyOnReconnect = sinon.spy();

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: spyOnError,
      onClose: function() {
        expect(spyOnConnect).to.have.been.calledOnce;
        expect(spyOnConnect).to.have.been.calledWithExactly();
        expect(spyOnError).to.not.have.been.calledOnce;
        expect(spyOnReconnect).to.not.have.been.calledOnce;
        done();
      },
      onReconnect: spyOnReconnect
    });

    connection.emit('connect');
    connection.emit('close');
  });

  it('should go into error code if error triggered', function(done) {
    // Given
    spyOnConnect = sinon.spy();
    spyOnClose = sinon.spy();
    spyOnReconnect = sinon.spy();

    var error = 'an error';

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: function(err) {
        expect(spyOnConnect).to.have.been.calledOnce;
        expect(spyOnConnect).to.have.been.calledWithExactly();
        expect(spyOnClose).to.not.have.been.calledOnce;
        expect(spyOnReconnect).to.not.have.been.calledOnce;
        done();
      },
      onClose: spyOnClose,
      onReconnect: spyOnReconnect
    });

    connection.emit('connect');
    connection.emit('error', error);
  });

  it('should attempt to reconnect if reconnect event triggered', function(done) {
    // Given
    spyOnConnect = sinon.spy();
    spyOnError = sinon.spy();
    spyOnClose = sinon.spy();

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: spyOnError,
      onClose: spyOnClose,
      onReconnect: function() {
        expect(spyOnConnect).to.have.been.calledOnce;
        expect(spyOnConnect).to.have.been.calledWithExactly();
        expect(spyOnClose).to.not.have.been.calledOnce;
        expect(spyOnError).to.not.have.been.calledOnce;
        done();
      }
    });

    connection.emit('connect');
    connection.emit('reconnect');
  });
});

describe('subscribe', function () {
  var barracksMessenger;
  var BarracksMessenger;
  var spyOnConnect;
  var spyOnError;
  var spyOnReconnect;
  var spyOnSubscribe;
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

  it('should subscribe to the topic and call the provided function', function (done) {
    // Given
    spyOnSubscribe = sinon.spy();
    spyOnConnect = sinon.spy();
    spyOnError = sinon.spy();
    spyOnReconnect = sinon.spy();
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

    connection.subscribe = sinon.stub().returns(true);

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: spyOnError,
      onClose: function () {
        expect(spyOnSubscribe).to.have.been.calledOnce;
        expect(spyOnSubscribe).to.have.been.calledWithExactly(messageReceived);
        expect(spyOnConnect).to.have.been.calledOnce;
        expect(spyOnError).to.not.have.been.calledOnce;
        expect(spyOnReconnect).to.not.have.been.calledOnce;
        done();
      },
      onReconnect: spyOnReconnect
    });

    barracksMessenger.subscribe(topic, spyOnSubscribe, { qos: 1 });

    connection.emit('connect');
    connection.emit('message', topic, message, packet);
    connection.emit('close');
  });
});

describe('end', function () {
  var barracksMessenger;
  var BarracksMessenger;
  var mockStream = new Stream();
  var connection = new Connection(mockStream);
  var Mqtt = require('mqtt');
  Mqtt.connect = sinon.stub().returns(connection);

  beforeEach(function () {
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

  it('should close the connection', function (done) {
    // Given
    var spyOnConnect = sinon.spy();
    var spyOnError = sinon.spy();
    var spyOnClose = sinon.spy();
    var spyOnReconnect = sinon.spy();
    var spyOnEnd = sinon.spy();

    connection.end = spyOnEnd;

    // When / Then
    barracksMessenger.connect({
      onConnect: spyOnConnect,
      onError: spyOnError,
      onClose: spyOnClose,
      onReconnect: spyOnReconnect
    });

    connection.emit('connect');
    barracksMessenger.end();
    expect(spyOnEnd).to.have.been.calledOnce;
    expect(spyOnEnd).to.have.been.calledWithExactly();
    expect(spyOnConnect).to.have.been.calledOnce;
    expect(spyOnConnect).to.have.been.calledWithExactly();
    expect(spyOnError).to.not.have.been.calledOnce;
    expect(spyOnReconnect).to.not.have.been.calledOnce;
    expect(spyOnClose).to.not.have.been.calledOnce;
    done();
  });
});

