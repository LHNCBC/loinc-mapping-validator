'use strict';

var fs = require('fs');
var path = require('path');
var csv = require('csv');
var EC = protractor.ExpectedConditions;
var inputFile = path.resolve(__dirname, '../data/sample-test-file.csv');
var outputDir = require('./outputPath');
var outputFile = path.join(outputDir, 'sample-test-file-results.csv');


// Upload the test data file, process it, and save (download) it to
// to the default location as configured in protractor.confjs
describe('LOINC Mapping Validator', function() {
  beforeAll(function(done) {
    // Prepare the output directory for sue as result file download destination
    if(fs.existsSync(outputDir)) { // Cleanup possible left-overs from previous rounds if things failed
      fs.readdirSync(outputDir).forEach(function (file) {
        if(file.match(/^sample-test-file-results.*\.csv$/)) {
          fs.unlinkSync(path.join(outputDir, file));
        }
      });
    }
    else {
      fs.mkdirSync(outputDir);
    }
    done();
  });

  it('should upload a file, process it, and save the results', function(done) {
    setAngularSite(false);
    browser.get('/');
    element(by.id('inputFile')).sendKeys(inputFile);    
    element(by.id('loincCol')).sendKeys('LOINC');    
    element(by.id('unitCol')).sendKeys('UNIT');    
    element(by.id('uploadAndValidate')).click();

    // wait until the page is properly rendered
    browser.wait(EC.visibilityOf(element(by.id('unitCol')))).then(() => {
      browser.sleep(3000).then(() => { // allow upload/process/download to finish
        expect(fs.existsSync(outputFile)).toEqual(true);  
        readCSV(outputFile).then(recList => {
          recList.forEach(rec => {
            expect(rec.expected_unit_status).toEqual(rec.LMV_UNIT_STATUS);
            expect(rec.expected_loinc_status).toEqual(rec.LMV_LOINC_STATUS);
          });
          fs.unlinkSync(outputFile);
        }, err => {
          console.error('Error processing results file:', outputFile);
          throw err;
        }).finally(() => { done(); });
      });
    });
  });
});


/**
 * Load validation result CSV file into a list of records.
 * @param csvFile the result CSV file.
 * @returns {Promise} resolves to the record list loaded.
 */
function readCSV(csvFile) {
  let recList = [];
  let parser = csv.parse({columns: true});

  parser.on('readable', function() {
    let record;
    while (record = parser.read()) {
      recList.push(record);
    }
  });

  return new Promise(function(resolve, reject) {
    parser.on('end', () => resolve(recList) );
    parser.on('error', (err) => reject(recList) );
    fs.createReadStream(csvFile).pipe(parser);
  });
}

