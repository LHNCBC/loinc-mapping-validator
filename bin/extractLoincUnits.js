
// This script extracts loinc-unit from the Loinc.csv file (main LoincTable file) and build
// a json file that maps loinc# to the list of units.


var fs = require('fs');
var csv = require('csv');

let argv = process.argv.slice(2);
if(argv.length != 2 || ! fs.existsSync(argv[1])) {
  console.error('Usage: <loinc-version> <Loinc.csv file>');
  process.exit(1);
}
let loincVersion = argv[0];
let loincFile = argv[1];

extractLoincUnits(loincFile, loincVersion);


/**
 * For the given LOINC file (Loinc.csv, the loinc table file), extract the LOINC_NUM and EXAMPLE_UCUM_UNITS
 * columns and build a mapping from the loinc number to its list of units (as an array). Note that
 * only loinc entries that have EXAMPLE_UCUM_UNITS are included.
 * Also, a special entry, "version" is added to the mapping where the value is the loinc version (e.g., 2.67),
 * to indicate the version of LOINC.
 * The resulting mapping is printed to stdout as a json string.
 * @param loincFile the Loinc.csv file
 * @return {Promise} promise that resolves to the number of entries extracted.
 */
function extractLoincUnits(loincFile, loincVersion) {
  let parser = csv.parse({columns: true});
  //let results = [];
  let results = {version: loincVersion};

  parser.on('readable', function() {
    let record;
    while (record = parser.read()) {
      if(record.EXAMPLE_UCUM_UNITS) {
        // results.push(record.LOINC_NUM + '\t' + record.EXAMPLE_UCUM_UNITS);
        results[record.LOINC_NUM] = record.EXAMPLE_UCUM_UNITS.split(/;[ ]*/g);
      }
    }
  });

  parser.on('end', () => {
    console.error(Object.keys(results).length + ' loinc-unit records extracted');
    console.log(JSON.stringify(results));
  });

  fs.createReadStream(loincFile).pipe(parser);
}



