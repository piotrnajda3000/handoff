// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Import shared setup that matches production environment
// @ts-expect-error - setup.jsx is a JSX file
import { TestWrapper } from "../../../src/setup.jsx";

import { mount } from "cypress/react";
import React from "react";

// Create a custom mount command that wraps components with the same providers as production
Cypress.Commands.add("mount", (component, options) => {
  const wrapped = React.createElement(TestWrapper, {}, component);
  return mount(wrapped, options);
});

// Example use:
// cy.mount(<MyComponent />)
