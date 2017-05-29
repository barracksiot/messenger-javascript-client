/* jshint expr: true, maxstatements: 100 */
/* global describe, it, beforeEach */

const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const expect = chai.expect;
const proxyquire =  require('proxyquire');

chai.use(sinonChai);

const UNIT_ID = 'unit1';
const API_KEY = 'validKey';
const CUSTOM_CLIENT_DATA = {
  aKey: 'aValue',
  anotherKey: true
};

describe('Constructor : ', function () {

  let Barracks;

  beforeEach(function () {
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

  it('Should return the Barracks object with default values when minimum options given', function () {
    // Given
    const options = {
      apiKey: API_KEY
    };

    // When
    const barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, 'https://app.barracks.io');
  });

  it('Should return the Barracks object with baseUrl overriden when url option given', function () {
    // Given
    const url = 'not.barracks.io';
    const options = {
      apiKey: API_KEY,
      baseURL: url
    };

    // When
    const barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, url);
  });

  it('Should return the Barracks object that do not accept self signed cert when option given with invalid value', function () {
    // Given
    const options = {
      apiKey: API_KEY,
      allowSelfSigned: 'plop'
    };

    // When
    const barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, 'https://app.barracks.io');
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).to.be.equals(undefined);
  });

  it('Should return the Barracks object that accepts self signed cert when option given', function () {
    // Given
    const options = {
      apiKey: API_KEY,
      allowSelfSigned: true
    };

    // When
    const barracks = new Barracks(options);

    // Then
    validateBarracksObject(barracks, 'https://app.barracks.io');
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).to.be.equals('0');
  });
});

describe('listenMessages(apiKey, unitId, timeout)', function() {

  let barracks;
  beforeEach({});
});