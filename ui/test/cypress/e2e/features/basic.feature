Feature: Basic Application Tests
  As a user
  I want to verify the application loads correctly
  So that I can ensure the basic functionality works

  Scenario: Application loads successfully
    Given I visit the home page
    Then I should see the element "div#root"

  Scenario: Page has correct title
    Given I visit the home page
    Then the page title should be "Vite + React + TS"

  Scenario: Basic navigation works
    Given I visit the home page
    Then the URL should contain "localhost"