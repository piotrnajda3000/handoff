Feature: Generate Tests Page
  As a user
  I want to upload code files and generate test cases
  So that I can create comprehensive tests for my codebase

  Background:
    Given I visit the generate tests page

  Scenario: Upload mock files and proceed to next step
    When I should see the welcome message
    And I should see the dropzone
    And the Next button should be disabled
    When I upload the mock files
    Then I should see 3 uploaded files
    And I should see the uploaded file "index.tsx"
    And I should see the uploaded file "dropzone.tsx"
    And I should see the uploaded file "use-dropzone.tsx"
    And the Next button should be enabled
    When I click the Next button
    Then I should be on step 2
    And I should see the generate tests content
