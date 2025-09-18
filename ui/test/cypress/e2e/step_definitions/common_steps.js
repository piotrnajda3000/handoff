import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Common navigation steps
Given("I visit the home page", () => {
  cy.visit("/");
});

Given("I visit {string}", (url) => {
  cy.visit(url);
});

// Common interaction steps
When("I click on {string}", (selector) => {
  cy.get(selector).click();
});

When("I click the {string} button", (buttonText) => {
  cy.contains("button", buttonText).click();
});

When("I type {string} into {string}", (text, selector) => {
  cy.get(selector).type(text);
});

When("I clear the {string} field", (selector) => {
  cy.get(selector).clear();
});

// Common assertion steps
Then("I should see {string}", (text) => {
  cy.contains(text).should("be.visible");
});

Then("I should see the element {string}", (selector) => {
  cy.get(selector).should("be.visible");
});

Then("the element {string} should contain {string}", (selector, text) => {
  cy.get(selector).should("contain.text", text);
});

Then("the element {string} should not be visible", (selector) => {
  cy.get(selector).should("not.be.visible");
});

Then("the page title should be {string}", (title) => {
  cy.title().should("eq", title);
});

Then("the URL should contain {string}", (urlPart) => {
  cy.url().should("include", urlPart);
});
