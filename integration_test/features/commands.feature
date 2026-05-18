Feature: Ribbon command behaviour
  As a user clicking the Power Prez Tools ribbon buttons
  I want clear feedback and a runtime that never hangs
  So that an old PowerPoint and ordinary mistakes are explained, never silent

  Background:
    Given an empty capture slot

  Scenario: Old PowerPoint is rejected with a message
    Given this PowerPoint is too old for the add-in
    And a shape "A" at left 100 top 50 width 200 height 150 is selected
    When I run the copy command
    Then I am shown a message to update PowerPoint
    And the capture slot is empty
    And the command signals it is done

  Scenario: An action error surfaces as a message, not a swallowed failure
    Given a shape "B" at left 10 top 10 width 30 height 30 is selected
    When I run the paste-both command
    Then I am shown a message that nothing has been captured yet
    And the command signals it is done

  Scenario: A successful command is silent and signals completion
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    When I run the copy command
    Then no message is shown
    And the capture slot holds left 100 top 50 width 200 height 150
    And the command signals it is done

  Scenario: The command signals completion even when the selection is invalid
    Given no shape is selected
    When I run the copy command
    Then I am shown a message that no shape is selected
    And the command signals it is done
