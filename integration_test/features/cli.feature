Feature: The installer command-line runner
  As someone running npx power-prez-tools
  I want each command to report clearly and exit with the right status
  So that success, mistakes, and macOS blocks are never silent

  Scenario: install reports where the manifest was placed
    Given the platform is "darwin" and the home directory is "/Users/jo"
    When I run the CLI with "install"
    Then the CLI says the manifest was installed
    And the CLI exits successfully

  Scenario: uninstall when nothing is installed is reported, not an error
    Given the platform is "darwin" and the home directory is "/Users/jo"
    When I run the CLI with "uninstall"
    Then the CLI says nothing was installed
    And the CLI exits successfully

  Scenario: an unknown command shows help and fails
    Given the platform is "darwin" and the home directory is "/Users/jo"
    When I run the CLI with "wat"
    Then the CLI prints usage help
    And the CLI exits with a failure

  Scenario: help prints usage
    Given the platform is "darwin" and the home directory is "/Users/jo"
    When I run the CLI with "help"
    Then the CLI prints usage help
    And the CLI exits successfully

  Scenario: an unsupported platform is explained and fails
    Given the platform is "freebsd" and the home directory is "/home/jo"
    When I run the CLI with "install"
    Then the CLI says the platform is unsupported
    And the CLI exits with a failure

  Scenario: a macOS-blocked install stages the manifest, reveals it, and explains
    Given the platform is "darwin" and the home directory is "/Users/jo"
    And creating the add-in folder is blocked by the system
    And Downloads exists
    When I run the CLI with "install"
    Then the CLI staged the manifest where the user can reach it
    And the CLI revealed the staged manifest
    And the CLI explains the macOS permission restriction
    And the CLI exits with a failure
