Feature: Capture and paste shape geometry
  As a presenter aligning images on a slide
  I want to copy one shape's position and size onto another
  So that images match without manual dragging

  Background:
    Given an empty capture slot

  Scenario: Capture position and dimensions of a selected shape
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    When I capture position and dimensions
    Then the capture slot holds left 100 top 50 width 200 height 150

  Scenario: Paste position onto another shape
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    And I capture position and dimensions
    And a shape "B" at left 10 top 10 width 30 height 30 is selected
    When I paste position
    Then shape "B" is at left 100 top 50 width 30 height 30

  Scenario: Paste dimensions onto another shape
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    And I capture position and dimensions
    And a shape "B" at left 10 top 10 width 30 height 30 is selected
    When I paste dimensions
    Then shape "B" is at left 10 top 10 width 200 height 150

  Scenario: Paste both position and dimensions
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    And I capture position and dimensions
    And a shape "B" at left 10 top 10 width 30 height 30 is selected
    When I paste both
    Then shape "B" is at left 100 top 50 width 200 height 150

  Scenario: Captured value survives the command runtime restarting
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    And I capture position and dimensions
    And the command runtime restarts
    And a shape "B" at left 10 top 10 width 30 height 30 is selected
    When I paste both
    Then shape "B" is at left 100 top 50 width 200 height 150

  Scenario: Pasting before anything is captured is rejected
    Given a shape "B" at left 10 top 10 width 30 height 30 is selected
    When I paste both
    Then I am told nothing has been captured yet
    And shape "B" is at left 10 top 10 width 30 height 30

  Scenario: Capturing with no selection is rejected
    Given no shape is selected
    When I capture position and dimensions
    Then I am told no shape is selected
    And the capture slot is empty

  Scenario: Capturing with multiple shapes selected is rejected
    Given shapes "A" and "C" are both selected
    When I capture position and dimensions
    Then I am told to select exactly one shape
    And the capture slot is empty

  Scenario: Pasting with multiple shapes selected is rejected
    Given a shape "A" at left 100 top 50 width 200 height 150 is selected
    And I capture position and dimensions
    And shapes "B" and "C" are both selected
    When I paste position
    Then I am told to select exactly one shape
