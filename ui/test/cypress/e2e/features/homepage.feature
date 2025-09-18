Feature: Homepage Navigation
  As a user
  I want to visit the homepage
  So that I can access the application

  Scenario: Visit the homepage
    Given I visit the home page
    Then I should see the element "body"
    And the page title should be "Vite + React + TS"

  Scenario: Check basic page elements
    Given I visit the home page
    Then I should see the element "div#root"
    And I should see "Welcome to Handoff"

  Scenario: Check file upload functionality
    Given I visit the home page
    Then I should see "Upload your code files"
    And I should see "Drag files here or click to select"