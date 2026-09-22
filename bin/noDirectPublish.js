
// This script is the prepublishOnly guard: it makes a direct "npm publish" from the
// repository fail, because publishing has to go through "npm run release" so that the
// package is built into dist/ first (see bin/buildPackage.js). Publishing the
// repository directly would ship the pretty-printed json files under data/, along with
// the tests and the maintainer scripts.
//
// npm always follows a failing lifecycle script with its own "npm error command failed"
// output, which cannot be turned off short of silencing npm globally. Keeping this guard
// in a file rather than inline in package.json at least keeps that output short.

console.error('\n#### "npm publish" is not used for this package.' +
  '\n#### Run "npm run release" instead: it builds dist/ (with the data files compacted)' +
  '\n#### and publishes from there.\n');

process.exit(1);

