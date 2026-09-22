
// This script builds the publishable package into the dist/ directory.
//
// The json files under data/ are kept pretty-printed in the repository so that
// changes to them show up as reviewable diffs. Those files are not part of the
// public API - they are only loaded internally by source/loincMappingValidator.js -
// so the published package ships a compacted copy of them instead, which is about
// half the size.
//
// The dist/ tree mirrors the repository layout, so the relative require() paths in
// the source files resolve unchanged and the published API is not affected.
// dist/ is exactly what gets published: npm publish ./dist

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Files copied verbatim, as paths relative to the repository root. Everything that
// is not listed here stays out of the published package (the tests, the data
// extraction scripts, this script, etc.).
const FILES_TO_COPY = [
  'index.js',
  'source/loincMappingValidator.js',
  'bin/validateLoincUnitCSV.js',   // the command line tool documented in README.md
  'data/sample-test-file.csv',     // the sample input for the command line tool
  'README.md',
  'LICENSE.md',                    // required: the license field says "SEE LICENSE IN LICENSE.md"
  'CHANGELOG.md'
];

// Files copied with their json content compacted, as paths relative to the
// repository root. These keep their location so that the require() calls in
// source/loincMappingValidator.js do not need to change.
const FILES_TO_COMPACT = [
  'data/loinc_unit.json',
  'data/unit_to_ucum_mapping.json'
];

// package.json fields that only make sense in the repository and are dropped from
// the published manifest. Note that no "files" field is generated: dist/ holds
// exactly what should be published, so it is the single source of truth.
const MANIFEST_FIELDS_TO_DROP = ['scripts', 'devDependencies'];


buildPackage();


/**
 * Build the publishable package into the dist/ directory. Any existing dist/
 * directory is removed first so that the build never carries stale files over.
 * Nothing outside of dist/ is written to - the files under data/ are only read.
 */
function buildPackage() {
  fs.rmSync(DIST_DIR, {recursive: true, force: true});

  for(let file of FILES_TO_COPY) {
    copyFile(file);
  }

  for(let file of FILES_TO_COMPACT) {
    compactJsonFile(file);
  }

  writeManifest();

  console.log('package built in ' + path.relative(process.cwd(), DIST_DIR) + '/');
}


/**
 * Copy one file from the repository into dist/, keeping its relative location.
 * @param file the file to copy, as a path relative to the repository root.
 */
function copyFile(file) {
  let destFile = path.join(DIST_DIR, file);

  fs.mkdirSync(path.dirname(destFile), {recursive: true});
  fs.copyFileSync(path.join(ROOT_DIR, file), destFile);
}


/**
 * Copy one json file from the repository into dist/, keeping its relative location
 * and writing it out without the indentation and line breaks of the source file.
 * @param file the json file to compact, as a path relative to the repository root.
 */
function compactJsonFile(file) {
  let srcFile = path.join(ROOT_DIR, file);
  let destFile = path.join(DIST_DIR, file);
  let content = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

  fs.mkdirSync(path.dirname(destFile), {recursive: true});
  fs.writeFileSync(destFile, JSON.stringify(content));

  console.error(file + ': ' + fs.statSync(srcFile).size + ' -> ' +
    fs.statSync(destFile).size + ' bytes');
}


/**
 * Write dist/package.json, based on the package.json of the repository with the
 * fields that only apply to the repository removed.
 */
function writeManifest() {
  let manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));

  for(let field of MANIFEST_FIELDS_TO_DROP) {
    delete manifest[field];
  }

  fs.writeFileSync(path.join(DIST_DIR, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
}

