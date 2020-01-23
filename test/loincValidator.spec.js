/**
 * Mocha tests for the Unit class.
 * Run from the command line with 'mocha testunit.js' or 'grunt test'
 */

var assert = require('assert');
var validator = require('../source/loincUnitValidator').validate;
var Status = require('../source/loincUnitValidator').ValidationStatus;
console.log(JSON.stringify(Status, null, 4));

var testData = [
  {loinc: '18833-4', unit: 'kg', status: Status.VALID},
  {loinc: '83167-7', unit: 'kg', status: Status.VALID},       // 83167-7 is ft (femtometric ton)
  {loinc: '83167-7', unit: '[ft_i]', status: Status.INVALID}, // 83167-7(ft) is femtometric ton}
  {loinc: '83167-7', unit: 'kggk', status: Status.INVALID},   // invalid UCUM unit
  {loinc: '99967-7', unit: 'kg', status: Status.UNKNOWN},     // No info about the LOINC
  {loinc: '64015-1', unit: '/week', status: Status.VALID},    // 64015-1 has unit /wk, we have mapping /week to /wk
  {loinc: '83164-4', unit: 'ft', status: Status.INVALID}      // 83164-4 has [ft_i] (length), and there is a mapping
                                                              // ft (as non-ucum unit) to ucum [ft_i], but the mapping should
                                                              // NOT be applied because ft is already a ucum (femtometric ton)
];


describe('Test LOINC units validation', function() {
  it("should correctly identify all possible validation outcomes", function() {
    for(var entry of testData) {
      var result = validator(entry.loinc, entry.unit);
      // console.log(JSON.stringify(result, null, 4));
      assert.equal(entry.status, result.status);
    }
  });
});
