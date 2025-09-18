// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for E2E testing
Cypress.Commands.add("visitHomePage", () => {
  cy.visit("/");
});

Cypress.Commands.add("shouldBeVisible", (selector) => {
  cy.get(selector).should("be.visible");
});

Cypress.Commands.add("shouldContainText", (selector, text) => {
  cy.get(selector).should("contain.text", text);
});
