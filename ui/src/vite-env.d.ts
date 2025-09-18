/// <reference types="vite/client" />

import { mount } from "cypress/vue";
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
