
// This script takes a csv that has, among others, two columns:
// - LOINC: a loinc code
// - UNIT: a unit that goes with that LOINC code
// and validate that the UNIT is compatible with the loinc code.
// After validation, 3 new columns will be added as defined in newCols below.
// Rows with missing/empty loinc or unit column values will have empty values for the new columns.

// This generates a hash that is the column name mapped to itself
let newCols = [
  'LMV_UNIT_STATUS',   // unit validation status, see UnitVldStatusNote for more details
  'LMV_UNIT_NOTE',     // unit validation note, see UnitVldStatusNote for more details
  'LMV_LOINC_STATUS',  // LOINC mapping validation status, see LoincVldStatusNote for more details
  'LMV_LOINC_NOTE',    // LOINC mapping validation note, see LoincVldStatusNote for more details
  'LMV_SUBSTITUTED_UNIT',  // if the input unit is not a valid UCUM unit but has a known mapping to a
                        // ucum unit that is compatible/valid to go with the input LOINC, then this column
                        // has that ucum unit
].reduce((acc, status)=>{acc[status] = status; return acc;}, {});

const fs = require('fs');
const csv = require('csv');
const validator = require('../source/loincMappingValidator');

if(require.main === module) {
  let cmdLineOpts = require('commander');
  cmdLineOpts
    .requiredOption('-i, --input-file <path>', 'required, input csv file name')
    .requiredOption('-l, --loinc-column <name>', 'required, loinc number column name')
    .requiredOption('-u, --unit-column <name>', 'required, unit column name')
    .option('-o, --output-file <path>', 'optional, output file, default to standard output')
    .parse(process.argv);

  let loincCol = cmdLineOpts.loincColumn;
  let unitCol = cmdLineOpts.unitColumn;

  let output = cmdLineOpts.outputFile?  fs.createWriteStream(cmdLineOpts.outputFile): process.stdout;
  let csvWriter = csv.stringify({header: true});
  csvWriter.pipe(output);

  validateCSV(cmdLineOpts.inputFile, csvWriter, loincCol, unitCol);
}


/**
 * See the comments at the top of this file for more details.
 * @param inputCSV the unit to ucum-unit mapping csv file.
 * @return {Promise} promise that resolves to the number of entries extracted.
 */
function validateCSV(inputCSV, csvWriter, loincCol, unitCol) {
  let parser = csv.parse({columns: true});
  let results = {};

  parser.on('readable', function() {
    let record;
    while (record = parser.read()) {
      record = validateRecord(record, loincCol, unitCol);
      csvWriter.write(record);
    }
  });

  parser.on('end', () => {
    csvWriter.end();
  });

  fs.createReadStream(inputCSV).pipe(parser);
}


/**
 * Validate one given record.
 * See the comments at the top of this file for more details.
 * @param record the record whose unit is to be validated.
 * @return the record with 3 new columns as the validation results.
 */
function validateRecord(record, loincCol, unitCol) {
  if(! record.hasOwnProperty(loincCol) || ! record.hasOwnProperty(unitCol)) {
    throw new Error('record missing loinc and/or unit column:', JSON.stringify(record, null, 4));
  }
  if(record[loincCol] && record[unitCol]) {
    let result = validator.validateLoincUnit(record[loincCol], record[unitCol]);
    record.LMV_UNIT_STATUS = result.unitStatus;
    record.LMV_SUBSTITUTED_UNIT = result.substituted_unit;
    record.LMV_LOINC_STATUS = result.loincStatus;
    record.LMV_UNIT_NOTE = validator.UnitVldStatusNote[record.LMV_UNIT_STATUS];
    if(record.LMV_LOINC_STATUS) { // can be empty if the unit is invalid
      record.LMV_LOINC_NOTE = validator.LoincVldStatusNote[record.LMV_LOINC_STATUS];
    }
  }
  else { // missing unit or loinc, add empty value to the new columns
    if (! record[unitCol]) {
      record.LMV_UNIT_STATUS = validator.UnitVldStatus.MISSING_UNIT;
    }
    if (! record[loincCol]) {
      record.LMV_LOINC_STATUS = validator.LoincVldStatus.MISSING_LOINC;
    }
    Object.keys(newCols).forEach(key => {record[key] = record[key] || ''});
  }

  return record;
}