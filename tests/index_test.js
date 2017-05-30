/* jshint expr: true, maxstatements: 100 */
/* global describe, it, beforeEach */

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;
var proxyquire =  require('proxyquire');

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

describe('listenMessages(apiKey, unitId, timeout)', function() {

  var barracks;
  beforeEach({});

  it('should work perfectly fine') ;
});