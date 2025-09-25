import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Navigate to generate tests page
Given("I visit the generate tests page", () => {
  cy.visit("/generate-tests");
});
// Navigation steps specific to the stepper
When("I click the Next button", () => {
  cy.get('[data-qa="next-button"]').click();
});

When("I click the Previous button", () => {
  cy.get('[data-qa="previous-button"]').click();
});

Then("the Next button should be enabled", () => {
  cy.get('[data-qa="next-button"]').should("not.be.disabled");
});

Then("the Next button should be disabled", () => {
  cy.get('[data-qa="next-button"]').should("be.disabled");
});

// Stepper assertions
Then("I should be on step {int}", (stepNumber: number) => {
  // The stepper is 0-indexed internally but we'll use 1-indexed for the tests
  const expectedStep = stepNumber - 1;

  cy.get('[data-qa="step"]')
    .eq(expectedStep - 1)
    .should("have.attr", "data-completed", "true");
});

const ELEMENTS = {
  "repository-url-input": '[data-qa="repository-url-input"]',
  "access-token-input": '[data-qa="access-token-input"]',
  "connect-repository-button": '[data-qa="connect-repository-button"]',
  "connected-repository-info": '[data-qa="connected-repository-info"]',
};

Given("I fill the repository url input with {string}", (url: string) => {
  cy.get(ELEMENTS["repository-url-input"]).type(url);
});

Given("I fill the access token input with {string}", (token: string) => {
  cy.get(ELEMENTS["access-token-input"]).type(token);
});

Given("I click the connect repository button", () => {
  cy.get(ELEMENTS["connect-repository-button"]).click();
});

Then("I should see the connected repository info {string}", (info: string) => {
  cy.get(ELEMENTS["connected-repository-info"]).should("contain.text", info);
});
