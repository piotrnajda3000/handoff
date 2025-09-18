const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        server: {
          fs: {
            allow: ["..", "../../node_modules"],
          },
        },
      },
    },
    specPattern: [
      "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
      "../src/**/*.cy.{tsx,ts}",
    ],
    supportFile: "cypress/support/component.jsx",
  },

  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.feature",
    async setupNodeEvents(on, config) {
      // Cucumber preprocessor setup
      on("file:preprocessor", async (file) => {
        const bundler = createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        });
        return bundler(file);
      });

      // Setup Cucumber preprocessor
      await preprocessor.addCucumberPreprocessorPlugin(on, config);

      return config;
    },
    supportFile: "cypress/support/e2e.js",
  },
});
