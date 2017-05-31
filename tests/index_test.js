/* jshint expr: true, maxstatements: 100 */
/* global describe, it, beforeEach */

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;
var proxyquire = require('proxyquire').noCallThru();
var Connection = require('mqtt-connection');
var Stream = require('stream');

chai.use(sinonChai);

var UNIT_ID = 'unit1';
var API_KEY = 'validKey';
var CUSTOM_CLIENT_DATA = {
  aKey: 'aValue',
  anotherKey: true
};

describe('Constructor : ', function () {

  var Barracks = require('../src/index.js');

  beforeEach(function() {
    Barracks = require('../src/index.js');
  });

  function validateBarracksObject(barracks, expectedBaseUrl) {
    expect(barracks).to.be.an('object');
    expect(barracks.options).to.be.an('object');
    expect(barracks.listenMessages).to.be.a('function');
    expect(barracks.options).to.deep.equals({
      apiKey: API_KEY,
      baseURL: expectedBaseUrl
    });
  }

  it('Should return the Barracks object with default values when minimum options given', function() {
    // Given
    var options = {
      apiKey: API_KEY
    };

    // When
    var barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, 'https://app.barracks.io');
  });

  it('Should return the Barracks object with baseUrl overriden when url option given', function() {
    // Given
    var url = 'not.barracks.io';
    var options = {
      apiKey: API_KEY,
      baseURL: url
    };

    // When
    var barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, url);
  });

  it('Should return the Barracks object that do not accept self signed cert when option given with invalid value', function() {
    // Given
    var options = {
      apiKey: API_KEY,
      allowSelfSigned: 'plop'
    };

    // When
    var barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, 'https://app.barracks.io');
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).to.be.equals(undefined);
  });

  it('Should return the Barracks object that accepts self signed cert when option given', function() {
    // Given
    var options = {
      apiKey: API_KEY,
      allowSelfSigned: true
    };

    // When
    var barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, 'https://app.barracks.io');
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).to.be.equals('0');
  });
});

describe('listenMessages', function() {

  var barracks;
  var Barracks;
  var spyOnConnect;
  var spyOnError;
  var spyOnClose;
  var spyOnMessage;
  var mockStream = new Stream();
  var connection = new Connection(mockStream);
  var Mqtt = require('mqtt');
  Mqtt.connect = sinon.stub().returns(connection);

  beforeEach( function() {
    mockStream = new Stream();
    connection = new Connection(mockStream);
    Mqtt = require('mqtt');
    Mqtt.connect = sinon.stub().returns(connection);
    connection.on('connect', function() {
      spyOnConnect();
    });
    connection.on('error', function(error) {
      spyOnError(error);
    });
    connection.on('close', function() {
      spyOnClose();
    });
    connection.on('message', function(topic, message, packet) {
      spyOnMessage(topic, message, packet);
    });

    Barracks = proxyquire('../src/index.js', {
      'mqtt-connection': connection
    });

    barracks = new Barracks({
      apiKey: 'abc',
      unitId: 'efg'
    });
  });

  it('should log message when message is received', function(done) {
    // Given
    spyOnMessage = sinon.spy();
    spyOnConnect = sinon.spy();
    spyOnClose = sinon.spy();
    var message = 'Un joli message';
    setTimeout(function() {
      connection.emit('connect');
      connection.emit('message', 'topic', message, 'packet');
      connection.emit('close');
    }, 500);

    // When / Then
    barracks.listenMessages('zer', 'zefd', 500).then(function(result) {
      expect(spyOnMessage).to.have.been.calledOnce;
      done();
    }).catch(function(err) {
      done(err);
    });
  });
  it('should connect properly', function(done) {
    // Given
    spyOnConnect = sinon.spy();
    spyOnClose = sinon.spy();
    setTimeout(function() {
      connection.emit('connect');
      connection.emit('close');
    }, 500);

    // When / Then
    barracks.listenMessages('abc', 'njk', 500).then(function(result) {
      expect(spyOnClose).to.have.been.calledOnce;
      expect(spyOnClose).to.have.been.calledWithExactly();
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('should reject error when connection fails', function(done) {
    // Given
    const error = 'This is an error';
    spyOnError = sinon.spy();
    setTimeout(function() {
      connection.emit('error', error);
    }, 500);

    // When / Then
    barracks.listenMessages('abc', 'efg', 500).then(function(result) {
      done('Should have failed');
    }).catch(function(err) {
      expect(err).to.be.equals('Connection error:' + error);
      expect(spyOnError).to.have.been.calledOnce;
      expect(spyOnError).to.have.been.calledWithExactly(error);
      done();
    });
  });
});