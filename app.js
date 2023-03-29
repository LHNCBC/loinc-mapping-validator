// Imports for webpack to find assets
import './app.css';
import './projectLogo.svg';

var path = require('path');
var csvParse = require('csv-parse').parse;
var transform = require('stream-transform').transform;
var csvStringify = require('csv-stringify').stringify;
var str2stream = require('string-to-stream');
var validator = require('loinc-mapping-validator').validator;
var getUrlFactory = () => (window.URL || window.webkitURL);
var getInputFileEle = () => document.getElementById("inputFile");

// new columns added to the result file - see README.md for more detils on these fields.
var newColumns = [ 'LMV_UNIT_STATUS', 'LMV_SUBSTITUTED_UNIT', 'LMV_LOINC_STATUS', 'LMV_UNIT_NOTE', 'LMV_LOINC_NOTE'];


/**
 * Show more/less of the description section in the first half of the page.
 * @param triggerEle the "show more/less" link element
 * @param showHideId the element id of the element to show/hide
 */
export function showMoreOrLess(triggerEle, showHideId) {
  var showHideEle = document.getElementById(showHideId);
  if(window.getComputedStyle(showHideEle).display === 'none') {
    showHideEle.style.display = 'block';
    triggerEle.innerHTML = 'Show less...';
  }
  else {
    showHideEle.style.display = 'none';
    triggerEle.innerHTML = 'Show more...';
  }
}


/**
 * Upload the csv file, process, and save the results - the save interaction depends on
 * the browser's configuration.
 */
export function uploadAndValidate() {
  var loincColName = document.getElementById("loincCol").value;
  var unitColName = document.getElementById("unitCol").value;
  var inputFileObj = getInputFileEle().files[0];
  if(! loincColName || ! unitColName || ! inputFileObj) {
    alert('The LOINC Column Name, the Unit Column Name, and the file name must be specified');
    return;
  }

  var reader = new FileReader();
  var parser = csvParse({columns: true});
  var stringifier = setupStringifier(inputFileObj.name);
  var transformer = transform((record) => validateRecord(record, loincColName.trim(), unitColName.trim()));

  reader.onload = function(event) {
    str2stream(event.target.result)
    .pipe(parser).on('error', (err) => { errHandler(err); })
    .pipe(transformer).on('error', (err) => { errHandler(err); })
    .pipe(stringifier).on('error', (err) => { errHandler(err); });
  };

  reader.readAsText(inputFileObj);
}


/**
 * Set up the csv-stringifier ready to take input stream and trigger the "save" result action
 * after done.
 * @param inputFileName the input file name (for validation), this is only used to create the result
 *        file name.
 * @return {stringify.Stringifier | *}
 */
function setupStringifier(inputFileName) {
  var stringifier = csvStringify({header: true});
  var data = [];
  stringifier.on('readable', function(){
    var row;
    while(row = stringifier.read()) {
      data.push(row);
    }
  });

  stringifier.on('error', (err) => { errHandler(err); });

  stringifier.on('finish', function() {
    data = data.join('');
    // console.log('DATA=\n', data);
    var blob = new Blob([data], {type: 'text/csv'});
    var objectUrl = getUrlFactory().createObjectURL(blob);
    var baseInputName = path.basename(inputFileName, '.csv');
    var outputFileName = baseInputName + '-results.csv';
    initiateDownload(outputFileName, objectUrl);
  });

  return stringifier;
}


/**
 *  This function is largely based on the function of same name in ucum-lhc.
 *  It controls display (and disposal) of the download dialog box that
 *  lets the user choose where to store the output file and to change
 *  the name of the file to be stored if desired.
 *
 *  It also clears the file name from input file field and blocks display
 *  of the column name division.
 * @param defaultFileName the default download file name
 * @param objectUrl the object url created for the blob that contains the validation results
 */
function initiateDownload(defaultFileName, objectUrl) {
  let downloadLink = document.createElement('a') ;
  downloadLink.setAttribute('id', 'downlink');
  downloadLink.setAttribute('href', objectUrl);
  downloadLink.setAttribute('download', defaultFileName);
  document.body.appendChild(downloadLink);

  downloadLink.dispatchEvent(new MouseEvent('click'));

  // cleanup
  getUrlFactory().revokeObjectURL(objectUrl);
  downloadLink.parentElement.removeChild(downloadLink);
}


/**
 * Just display the given error message or error.
 * @param err an error message string or error object, should not be empty
 */
function errHandler(err) {
  var errMsg = err? (typeof err === 'string'? err: err.message): "Unknown error";
  alert(errMsg);
  console.log(errMsg);
}


/**
 * Validate one given record.
 * See the comments at the top of this file for more details.
 * @param record the record whose unit is to be validated.
 * @return the record with 5 new columns as the validation results.
 */
function validateRecord(record, loincCol, unitCol) {
  // console.log(record);
  if(! record.hasOwnProperty(loincCol) || ! record.hasOwnProperty(unitCol)) {
    var missing = record.hasOwnProperty(loincCol)? unitCol:
      record.hasOwnProperty(unitCol)? loincCol: loincCol + ' and ' + unitCol;
    var msg = 'You specified "' +  loincCol + '" as the LOINC number column, "' + unitCol +
      '" as the unit column, but the record does not have ' + missing + ':\n' +
      JSON.stringify(record, null, 4);
    throw new Error(msg);
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
  else { // missing unit or loinc
    if (! record[unitCol]) {
      record.LMV_UNIT_STATUS = validator.UnitVldStatus.MISSING_UNIT;
    }
    if (! record[loincCol]) {
      record.LMV_LOINC_STATUS = validator.LoincVldStatus.MISSING_LOINC;
    }
  }
  // Add empty string value to the new columns that don't yet have a value
  newColumns.forEach(key => {record[key] = record[key] || ''});

  return record;
}

