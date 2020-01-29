
// https://github.com/lhncbc/ucum-lhc

const ucum = require('@lhncbc/ucum-lhc');
const utils = ucum.UcumLhcUtils.getInstance();

const _loinc2Units = require('../data/loinc_unit.json'); // these are ucum units
const _units2UcumUnits = require('../data/unit_to_ucum_mapping.json');

const UnitVldStatusNote = {
  VALID: 'The unit is a valid UCUM unit.',
  INVALID_FIXED: 'The unit is not a UCUM unit but there is a known mapping to a UCUM unit as provided under LMV_SUBSTITUTED_UNIT',
  INVALID_UNKNOWN: 'The unit is not a UCUM unit and there is no known mapping to a UCUM unit',
  MISSING_UNIT: 'The unit is not provided'
};
const UnitVldStatus = Object.keys(UnitVldStatusNote).reduce(
  (acc, key) => {acc[key] = key; return acc;}, {});

// leave the LOINC status column blank if the unit is unknown (with status INVALID_UNKNOWN)
const LoincVldStatusNote = {
  CORRECT: 'The LOINC mapping matches with the unit',
  INCORRECT: 'The LOINC mapping does not match with the unit',
  UNKNOWN: 'Unit information not available for the LOINC number',
  MISSING_LOINC: 'The LOINC number is not provided'
};
const LoincVldStatus = Object.keys(LoincVldStatusNote).reduce(
  (acc, key) => { acc[key] = key; return acc; }, {});


/**
 * Valid if the given unit is a ucum unit and is compatible with the given LOINC.
 * @param loinc the loinc number for the check
 * @param unit the unit for the check
 * @return an object with the following fields: loinc, unit, unitStatus, substituted_unit,
 *         and loincStatus, where:
 *         loinc and unit: the same as the input loinc and unit
 *         unitStatus: see UnitVldStatusNote for more details
 *         loincStatus: see LoincVldStatusNote for more details
 *         substituted_unit: a ucum unit that the given unit can be mapped to (when it's non-ucum unit)
 */
function validateLoincUnit(loinc, unit) {
  var result = {unit, loinc};

  // First check the status of the unit
  var ucumVldStatus = utils.validateUnitString(unit);
  if (ucumVldStatus.status === 'valid') { // the given unit is not a ucum unit
    result.unitStatus = UnitVldStatus.VALID;
  }
  else {
    unit = _units2UcumUnits[unit];
    if(unit) {
      result.unitStatus = UnitVldStatus.INVALID_FIXED;
      result.substituted_unit = unit;
    }
    else {
      result.unitStatus = UnitVldStatus.INVALID_UNKNOWN;
    }
  }

  // Then check the status of the LOINC mapping
  if(result.unitStatus === UnitVldStatus.INVALID_UNKNOWN) {
    result.loincStatus = ''; // leave blank, can't say anything about LOINC if don't know the unit.
  }
  else {
    var units4Loinc = _loinc2Units[loinc];
    if(! units4Loinc) { // no UCUM units are specified for the given loinc# in the LOINC table
      result.loincStatus = LoincVldStatus.UNKNOWN;
    }
    else {
      if (isUnitCompatible(unit, units4Loinc)) {
        result.loincStatus = LoincVldStatus.CORRECT;
      }
      else {
        result.loincStatus = LoincVldStatus.INCORRECT;
      }
    }
  }

  return result;
}


/**
 * Check if the given unit is compatible with ANY of the given list of units - all units
 * must be valid ucum units. Two ucum units are compatible if they are the same or one
 * can be converted to another.
 * @param ucumUnit the given ucum unit to check
 * @param ucumUnitList the list of ucum unit against which to check the given ucum unit
 * @return true if the given ucum unit is compatible with any unit in the given list, false otherwise.
 */
function isUnitCompatible(ucumUnit, ucumUnitList) {
  var isCompatible = false;

  for(var loincUnit of ucumUnitList) {
    if(ucumUnit === loincUnit || // first try direct match
      utils.convertUnitTo(ucumUnit, 100, loincUnit).status === 'succeeded') { // see if convertible from one to another
      isCompatible = true;
      break;
    }
  }

  return isCompatible;
}


module.exports = {
  UnitVldStatus,
  UnitVldStatusNote,
  LoincVldStatus,
  LoincVldStatusNote,
  validateLoincUnit
};
