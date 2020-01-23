###A UCUM LOINC Validator

This validator is designed to validate if a UCUM unit is appropriate for a 
given LOINC code. Currently there is only a command line validator that can be
used to batch validate the units and loincs in a CSV file, and output the results
to the given output file (if provided) or standard output. 


Input File
- must be a CSV file
- must have the column name row (header row)
- must have a column for the unit
- must have a column for the LOINC

Output File
- A CSV file with all the columns in the input file
- 3 new columns for the validation results:
    - \_ULV_STATUS\_: validation results, possible values are: VALID, INVALID, and UNKNOWN
    - \_ULV_NOTE\_: anything worth reporting 
    - \_ULV_SUGGEST_UNIT\_: if the given unit is not a UCUM unit and there is a known mapping 
    to a UCUM unit.
    
    
To use the script:    
- install Node js on your system
- install this package

node bin/validateLoincUcumCSV.js -i <input-csv-file> -l <loinc-column-name> -u <unit-column-name> [-o <output-file>]

The output is optional, default to standard output (terminal)   

