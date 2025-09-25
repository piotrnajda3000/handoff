Feature: Generate Tests Page
  As a user
  I want to upload code files and generate test cases
  So that I can create comprehensive tests for my codebase

  Background:
    Given I visit the generate tests page

  Scenario: Enter repo details and connect repository
    When I fill the repository url input with "https://github.com/facebook/react"
    And I fill the access token input with "1234567890"
    And I click the connect repository button
    Then I should see the connected repository info "Connected to facebook/react"
