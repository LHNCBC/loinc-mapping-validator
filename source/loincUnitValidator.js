
// https://github.com/lhncbc/ucum-lhc

const ucum = require('@lhncbc/ucum-lhc');
const utils = ucum.UcumLhcUtils.getInstance();

const loinc2Units = require('../data/loinc_unit.json'); // these are ucum units
const units2UcumUnits = require('../data/unit_to_ucum_mapping.json');

const ValidationStatus = ['VALID', 'INVALID', 'UNKNOWN']
  .reduce((acc, status)=>{acc[status] = status; return acc;}, {});
const ValidationNotes = {
  Invalid: 'The unit is not a valid UCUM unit',
  Unknown: 'Unit information is not available for the LOINC',
  Incompatible: 'The unit is not compatible with the LOINC',
  Suggest: 'The unit is not a ucum unit, a comaptible ucum unit is suggested/used in the validation'
};


/**
 * Valid if the given unit is a ucum unit and is compatible with the given LOINC.
 * @param loinc the loinc number the given unit is for.
 * @param unit the unit to check
 * @return an object with the following fields: loinc, unit, status, suggested_unit, note(optional), where:
 *     loinc and unit: the same as the input loinc and unit
 *     status: can be VALID, INVALID, UNKNOWN (the loinc does not have any UCUM units specified in LOINC release)
 *     suggested_unit: a ucum unit that is considered compatible with the given unit (when it's non-ucum)
 *     note: brief explanation about the status
 *
 */
function validateLoincUnit(loinc, unit) {
  var result = {unit, loinc};

  var units4Loinc = loinc2Units[loinc];
  if(! units4Loinc) { // no UCUM units are specified for the given loinc# in the LOINC table
    result.status = ValidationStatus.UNKNOWN;
    result.note = ValidationNotes.Unknown;
  }
  else {
    var ucumValidationStatus = utils.validateUnitString(unit);
    if (ucumValidationStatus.status != 'valid') { // the given unit is not a ucum unit
      unit = units2UcumUnits[unit]; // if there is a known mapping to ucum unit, do the mapping, or unit is undefined.
    }

    if (unit) { // now known to be a valid ucum unit, or already mapped to a ucum unit
      if (isUnitCompatible(unit, units4Loinc)) {
        result.status = ValidationStatus.VALID;
        if (result.unit != unit) { // the above mapping with units2UcumUnits was successful
          result.suggested_unit = unit;
          result.note = ValidationNotes.Suggest;
        }
      }
      else {
        result.status = ValidationStatus.INVALID;
        result.note = ValidationNotes.Incompatible;
      }
    }
    else {
      result.status = ValidationStatus.INVALID;
      result.note = ValidationNotes.Invalid;
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
      utils.convertUnitTo(ucumUnit, 100, loincUnit).status == 'succeeded') { // see if convertible from one to another
      isCompatible = true;
      break;
    }
  }

  return isCompatible;
}


module.exports = {
  ValidationNotes: ValidationNotes,
  ValidationStatus: ValidationStatus,
  validate: validateLoincUnit
};
