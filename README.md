### LOINC Mapping Web Validator
This is a web-based LOINC Mapping Validator tool that uses the JavaScript
<a href="https://github.com/lhncbc/loinc-mapping-validator">LOINC Mapping Validator library</a>
to check whether LOINC codes have been correctly assigned.
Please see the <a href="https://lhcforms.nlm.nih.gov/fhir/loinc-mapping-validator/index.html">web page</a> or the index.html file in this directory for more details.

#### Build/host the web validator on your own system

It's very simple to build and host the web-based validator on your own system, just
follow the following steps:
- Install Node.js on your system if not already
- Download/clone the project into a directory, for example, loinc-mapping-validator/
- cd loinc-mapping-validator
- npm ci
- npm run build 

The build will be in the loinc-mapping-validator/public/ directory.

You may point your browser at the index.html in that directory and the 
validator is ready for use, hosted on your own system. If you prefer, you may
also deploy (copy) that directory to any other places of your choice.
