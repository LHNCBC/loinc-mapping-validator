/**
 * Mocha tests for the Unit class.
 * Run from the command line with 'mocha testunit.js' or 'grunt test'
 */

var assert = require('assert');
var validator = require('../index').validator;
var UnitStatus = validator.UnitVldStatus;
var LoincStatus = validator.LoincVldStatus;

var testData = [
  { loinc: '18833-4', unit: 'kg',     // 18833-4: first body weight
    unitStatus: UnitStatus.VALID, loincStatus: LoincStatus.CORRECT
  },
  { loinc: '83167-7', unit: 'kg',     // 83167-7 has unit ft (femtometric ton)
    unitStatus: UnitStatus.VALID, loincStatus: LoincStatus.CORRECT
  },
  { loinc: '83167-7', unit: '[ft_i]', // 83167-7 has unit ft (femtometric ton)
    unitStatus: UnitStatus.VALID, loincStatus: LoincStatus.INCORRECT
  },
  { loinc: '83167-7', unit: 'kggk',   // invalid UCUM unit
    unitStatus: UnitStatus.INVALID_UNKNOWN, loincStatus: ''
  },
  { loinc: '99967-7', unit: 'kg',     // No unit info about the LOINC
    unitStatus: UnitStatus.VALID, loincStatus: LoincStatus.UNKNOWN
  },
  { loinc: '64015-1', unit: '/week',  // 64015-1 has unit /wk, we have mapping /week to /wk
    unitStatus: UnitStatus.INVALID_FIXED, loincStatus: LoincStatus.CORRECT},

  { loinc: '83164-4', unit: 'ft',     // 83164-4 has [ft_i] (length), and there is a mapping
                                      // ft (as non-ucum unit) to ucum [ft_i], but the mapping
                                      // should NOT be applied because ft is already a ucum (femtometric ton)
    unitStatus: UnitStatus.VALID, loincStatus: LoincStatus.INCORRECT
  }
];


describe('Test LOINC units validation', function() {
  it("should correctly identify all possible validation outcomes", function() {
    for(var entry of testData) {
      var result = validator.validateLoincUnit(entry.loinc, entry.unit);
      assert.equal(entry.unitStatus, result.unitStatus);
      assert.equal(entry.loincStatus, result.loincStatus);
    }
  });
});


// Substitutions whose UCUM value did not match the unit spelled in the key.
var substitutionData = [
  { loinc: '8310-5', unit: 'def F', substituted_unit: '[degF]' },   // misspelling of deg F, not of deg C
  { loinc: '21218-3', unit: 'CH 100 U', substituted_unit: "{CH100'U}" },  // as for CH 50 U, no volume in the key
  { loinc: '11253-4', unit: 'Fraction', substituted_unit: '{fraction}' }
];

describe('Test non-UCUM unit substitutions', function() {
  it("should substitute the unit named in the key", function() {
    for(var entry of substitutionData) {
      var result = validator.validateLoincUnit(entry.loinc, entry.unit);
      assert.equal(UnitStatus.INVALID_FIXED, result.unitStatus);
      assert.equal(entry.substituted_unit, result.substituted_unit);
    }
  });
});
