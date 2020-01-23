
// This script takes a csv of units-to-ucum mapping and build a json object to represent the mapping.
// We received a spreadsheet file from LOINC, named LoincPropertiesAndUnits_2020021.xlsx
// Save the UNIT_TO_UCUM_MAPPING sheet/tab as a csv, which is the input for this script.
// The csv file contains 3 columns, among others (these other fields don't need to be there):
// - UNITS: the units to be mapped
// - UCUM_UNITS: the ucum units the UNITS is mapped to
// - STATUS: VALID/valid, invalid/INVALID
// - **** we are only taking valid entries where the unit and ucum unit are different.


var fs = require('fs');
var csv = require('csv');


extractValidMappings(process.argv[2]);

/**
 * See the comments at the top of this file for more details.
 * @param mappingFileCSV the unit to ucum-unit mapping csv file.
 * @return {Promise} promise that resolves to the number of entries extracted.
 */
function extractValidMappings(mappingFileCSV) {
  let parser = csv.parse({columns: true});
  let results = {};

  parser.on('readable', function() {
    let record;
    while (record = parser.read()) {
      if(record.STATUS.toUpperCase() == 'VALID') {
        let units = record.UNITS.split(/;[ ]*/g);
        let ucum_units = record.UCUM_UNITS.split(/;[ ]*/g);
        for(let unit of units) {
          if(! ucum_units.includes(unit)) {
            results[unit] = ucum_units[0]; // just map to the first one, we only care about compatibility
          }
        }
      }
    }
  });

  parser.on('end', () => {
    console.error(Object.keys(results).length + ' loinc-unit records extracted')
    console.log(JSON.stringify(results));
  });

  fs.createReadStream(mappingFileCSV).pipe(parser);
}
