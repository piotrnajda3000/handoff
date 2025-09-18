Feature: File Upload Dropzone
  As a user
  I want to use a dropzone component
  So that I can upload files to the application

  Background:
    Given I visit the home page

  Scenario: View dropzone component
    When I should see the element "[data-testid='dropzone']"
    Then the element "[data-testid='dropzone']" should contain "Upload files"

  Scenario: Dropzone interaction
    When I click on "[data-testid='dropzone']"
    Then I should see the element "input[type='file']"

  Scenario: File upload feedback
    When I click on "[data-testid='dropzone']"
    And I should see "Drag images here or click to select files"
    Then I should see the element ".mantine-Dropzone-root"