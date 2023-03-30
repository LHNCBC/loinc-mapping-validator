const { defineConfig } = require("cypress");

module.exports = defineConfig({
  watchForFileChanges: false,
  downloadsFolder:	'test/cypress/downloads',
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  e2e: {
    specPattern: 'test/cypress/e2e/**/*.cy.js',
    supportFile: 'test/cypress/support/e2e.js',
    //setupNodeEvents(on, config) {
    //   implement node event listeners here
    //},
  },
});
