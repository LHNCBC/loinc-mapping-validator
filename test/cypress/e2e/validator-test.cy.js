
'use strict';

const parseCsv = require('csv-parse/lib/sync').parse;

// The input/output paths are relative to the directory where cypress.config.js lives
const inputFile = 'test/cypress/fixtures/sample-test-file.csv';
const outputFile = 'test/cypress/downloads/sample-test-file-results.csv';

// Upload the test data file, process it, and save (download) the results file
describe('LOINC Mapping Validator', function() {
  before(function() { // clean up previously saved results file, if exists
    cy.exec("rm -f " + outputFile);
  });

  beforeEach(() => {
    cy.visit('./public/index.html');
  });

  it('should upload a file, process it, and save the results', function() {
    cy.get('#inputFile').selectFile(inputFile);
    cy.get('#loincCol').type('LOINC');
    cy.get('#unitCol').type('UNIT');
    cy.get('#uploadAndValidate').click();

    cy.readFile(outputFile).then((data) => {
      let records = parseCsv(data, {columns: true});
      expect(records.length).to.equal(9);
      records.forEach(rec => {
        expect(rec.expected_unit_status).to.equal(rec.LMV_UNIT_STATUS);
        expect(rec.expected_loinc_status).to.equal(rec.LMV_LOINC_STATUS);
      })
    });
  });
});
