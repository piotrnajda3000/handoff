# Cypress E2E Testing with Cucumber/Gherkin

This directory contains Cypress end-to-end tests written in natural language using Cucumber/Gherkin syntax.

## Directory Structure

```
cypress/
├── e2e/
│   ├── features/           # Gherkin feature files (.feature)
│   │   ├── homepage.feature
│   │   └── dropzone.feature
│   └── step_definitions/   # Step implementations
│       └── common_steps.js
└── support/               # Support files and configuration
    ├── commands.js        # Custom Cypress commands
    └── e2e.js            # E2E support setup
```

## Running Tests

### Interactive Mode (Cypress GUI)

```bash
yarn cypress:open
```

### Headless Mode

```bash
# Run all E2E tests
yarn test:e2e

# Run E2E tests with browser visible
yarn test:e2e:headed

# Run all Cypress tests
yarn cypress:run
```

## Writing Tests

### Feature Files (.feature)

Write your tests in natural language using Gherkin syntax in `cypress/e2e/features/`:

```gherkin
Feature: User Authentication
  As a user
  I want to log into the system
  So that I can access my account

  Scenario: Successful login
    Given I visit the login page
    When I enter valid credentials
    Then I should be logged in
```

### Step Definitions

Implement the steps in JavaScript files in `cypress/e2e/step_definitions/`:

```javascript
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I visit the login page", () => {
  cy.visit("/login");
});

When("I enter valid credentials", () => {
  cy.get("[data-testid='username']").type("user@example.com");
  cy.get("[data-testid='password']").type("password");
  cy.get("[data-testid='login-button']").click();
});

Then("I should be logged in", () => {
  cy.url().should("include", "/dashboard");
  cy.contains("Welcome").should("be.visible");
});
```

## Pre-built Step Definitions

The `common_steps.js` file includes commonly used step definitions:

- **Navigation**: `Given I visit the home page`, `Given I visit "/path"`
- **Interactions**: `When I click on "selector"`, `When I type "text" into "selector"`
- **Assertions**: `Then I should see "text"`, `Then the element "selector" should contain "text"`

## Configuration

The Cypress configuration is set up in `cypress.config.js` to:

- Use `.feature` files as test specs
- Process Gherkin syntax with Cucumber preprocessor
- Support TypeScript/JavaScript step definitions
- Use esbuild for fast compilation

## Tips

1. **Use data-testid attributes** in your React components for reliable element selection
2. **Keep scenarios focused** - test one thing at a time
3. **Use Background steps** for common setup across scenarios
4. **Organize features by functionality** rather than by page
5. **Write descriptive scenario names** that explain the user goal

## Example Commands

```bash
# Open Cypress in interactive mode
yarn cypress:open

# Run specific feature file
yarn cypress:run --spec "cypress/e2e/features/homepage.feature"

# Run with specific browser
yarn cypress:run --browser chrome

# Generate test reports
yarn cypress:run --reporter json --reporter-options output=reports/results.json
```
