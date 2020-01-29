### A LOINC Mapping Validator

This validator is designed to validate/check whether the LOINC mapping for the records
are correct. Currently it only considers the unit of a record but down the road this
might be expanded to consider the values and potentially other factors as well.

##### The LOINC Mapping Validator Library
At the core of this package is the LOINC mapping library. To use the library:

const validator = require('@lhncbc/loinc-mapping-validator');
The validator exposes the following elements:
- validator.validateLoincUnit() is the function that you can call to validate a given 
  (unit, LOINC number) to see if they go together.  
  Input parameters - validator.validateLoincUnit(loinc, unit):
    - loinc: the LOINC number whose mapping is to be checked
    - unit: the unit string that is used to validate the LOINC mapping.   
  Output: an object with the following fields:
      - loinc: the same as the input loinc
      - unit: the same as the input unit
      - unitStatus: unit validation status code, see UnitVldStatus below for more details
      - loincStatus: LOINC mapping validation status code, see LoincVldStatus below for more details
      - substituted_unit: a ucum unit that the given unit can be mapped to (when it's non-ucum unit)  
- validator.UnitVldStatus specifies the set of status codes of unit validation results -
  see UnitVldStatusNote below for more details.
- validator.UnitVldStatusNote describes the status codes in UnitVldStatus:
    - VALID: The unit is a valid UCUM unit
    - INVALID_FIXED: The unit is not a UCUM unit but there is a known mapping 
      to a UCUM unit as provided under LMV_SUBSTITUTED_UNIT,
    - INVALID_UNKNOWN: The unit is not a UCUM unit and there is no known mapping to a UCUM unit
    - MISSING_UNIT: The unit is not provided as input
- validator.LoincVldStatus specifies the set of status codes of LOINC mapping validation 
  results. See LoincVldStatusNote below for more details.
- validator.LoincVldStatusNote describes the status codes in LoincVldStatus:
    - CORRECT: The LOINC mapping matches with the unit
    - INCORRECT: The LOINC mapping does not match with the unit
    - UNKNOWN: Unit information not available for the LOINC number
    - MISSING_LOINC: The LOINC number is not provided

##### The Command-line Tool
There is a command line tool that comes with this package, which you can use to
batch validate records in a CSV input file, and output a new CSV file that contains
all the input columns plus a few new columns that indicate the validation status
for each record.

To use the command line tool, you will need to work with Windows command terminals or
Linux terminals.
- Install Node.js on your system
- Download this package

To validate the test file that comes with this package:

    cd into the directory where you saved this package
    node bin/validateLoincUnitCSV.js -i data/sample-test-file.csv -l LOINC -u UNIT

Here are more details on the command line syntax/options:

    node bin/validateLoincUnitCSV.js -i <input-csv-file> -l <loinc-column-name> -u <unit-column-name> [-o <output-file>]
Where:
- \<input-csv-file\>
    - must be a CSV file - there are different variants of CSV files, we can't guarantee that
      this tool works with every one of them. But we've tested it that it works with the CSV 
      file saved from Microsoft excel as "CSV (Comma Delimited)" format.
    - must have the column name row (header row)
    - must have a column for the unit
    - must have a column for the LOINC number
- \<loinc-column-name\>
    - The name of the column that has the LOINC number
- \<unit-column-name\>
    - The name of the column that has the unit
- \<output-file\>
   - This parameter is optional, and if not specified, will print to the standard output (terminal)
   - A CSV file with all the columns in the input file
   - 5 new columns for the validation results:
      - LMV_UNIT_STATUS: the validation status of the unit See the descriptions on 
        UnitVldStatusNote above for more details
      - LMV_LOINC_STATUS: the validation status of the LOINC mapping. See the descriptions  
        on LoincVldStatusNote above for more details.
      - LMV_SUBSTITUTED_UNIT: if the given unit is not a UCUM unit and there is a known mapping 
        to a UCUM unit, it will be suggested here.
      - LMV_UNIT_NOTE: a note explaining the LMV_UNIT_STATUS. See the descriptions on
        UnitVldStatusNote above for more details
      - LMV_LOINC_NOTE: a note explaining the LMV_LOINC_STATUS. See the descriptions on
        LoincVldStatusNote above for more details 
    
