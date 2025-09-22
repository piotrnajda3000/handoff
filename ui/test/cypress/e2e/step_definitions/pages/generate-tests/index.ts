import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { FILES_TO_TEXT_AS_FILES } from "@ui/mocks/files.mock";

// Navigate to generate tests page
Given("I visit the generate tests page", () => {
  cy.visit("/generate-tests");
});

// File upload steps
When("I upload the mock files", () => {
  const dropzoneSelector = '[data-qa="dropzone-container"]';

  // Wait for the dropzone to be visible
  cy.get(dropzoneSelector).should("be.visible");

  // Get the mock files and upload them
  const files = FILES_TO_TEXT_AS_FILES;

  // For Cypress file upload, we need to create the files with proper format
  const fileFixtures = files.map((file, index) => ({
    contents: file.text || "",
    fileName: file.name,
    mimeType: "text/plain",
  }));

  // Upload files to the dropzone
  cy.get(dropzoneSelector).selectFile(fileFixtures, {
    action: "drag-drop",
  });
});

When("I upload {int} mock files", (fileCount: number) => {
  const dropzoneSelector = '[data-qa="dropzone-container"]';

  // Wait for the dropzone to be visible
  cy.get(dropzoneSelector).should("be.visible");

  // Get the specified number of mock files
  const files = FILES_TO_TEXT_AS_FILES.slice(0, fileCount);

  // Create file fixtures for Cypress
  const fileFixtures = files.map((file, index) => ({
    contents: file.text || "",
    fileName: file.name,
    mimeType: "text/plain",
  }));

  // Upload files to the dropzone
  cy.get(dropzoneSelector).selectFile(fileFixtures, {
    action: "drag-drop",
  });
});

// Navigation steps specific to the stepper
When("I click the Next button", () => {
  cy.get('[data-qa="next-button"]').click();
});

When("I click the Previous button", () => {
  cy.get('[data-qa="previous-button"]').click();
});

// Assertions for file upload
Then("I should see {int} uploaded files", (fileCount: number) => {
  // Check that the correct number of files are displayed
  for (let i = 0; i < fileCount; i++) {
    cy.get(`[data-qa="selected-file-${i}"]`).should("be.visible");
  }
});

Then("I should see the uploaded file {string}", (fileName: string) => {
  cy.get('[data-qa^="selected-file-"]').should("contain.text", fileName);
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

Then("I should see the step title {string}", (stepTitle: string) => {
  cy.contains(".mantine-Stepper-stepLabel", stepTitle).should("be.visible");
});

// Page content assertions
Then("I should see the welcome message", () => {
  cy.contains("Welcome to Handoff").should("be.visible");
});

Then("I should see the generate tests content", () => {
  cy.contains("Generate Tests").should("be.visible");
  cy.contains("Processing your files").should("be.visible");
});

Then("I should see the dropzone", () => {
  cy.get('[data-qa="dropzone-container"]').should("be.visible");
  cy.get('[data-qa="dropzone-text-content"]').should("be.visible");
});
