Feature: Install the add-in into PowerPoint
  As someone who wants to use Power Prez Tools
  I want a single command to register the add-in
  So that I can enable it in PowerPoint without manual file copying

  Scenario: Resolve the PowerPoint add-in folder on macOS
    Given the platform is "darwin" and the home directory is "/Users/jo"
    When I resolve the add-in folder
    Then the add-in folder is "/Users/jo/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef"

  Scenario: Install copies the manifest, creating the folder when missing
    Given the platform is "darwin" and the home directory is "/Users/jo"
    And the add-in folder does not exist
    When I install the manifest from "/pkg/manifest.prod.xml"
    Then the add-in folder is created
    And the manifest is written to "/Users/jo/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef/power-prez-tools.manifest.xml"

  Scenario: Uninstall removes a previously installed manifest
    Given the platform is "darwin" and the home directory is "/Users/jo"
    And the manifest is already installed from "/pkg/manifest.prod.xml"
    When I uninstall
    Then the manifest is no longer installed
    And uninstall reports that it was removed

  Scenario: Uninstall is harmless when nothing is installed
    Given the platform is "darwin" and the home directory is "/Users/jo"
    When I uninstall
    Then uninstall reports that nothing was installed

  Scenario: An unsupported platform is rejected with a clear message
    Given the platform is "freebsd" and the home directory is "/home/jo"
    When I resolve the add-in folder
    Then I am told the platform is unsupported

  Scenario: Install on Windows stores the manifest and registers it
    Given the platform is "win32" and the home directory is "C:\Users\jo"
    When I install the manifest from "/pkg/manifest.prod.xml"
    Then the manifest is written to "C:\Users\jo\AppData\Local\PowerPrezTools\power-prez-tools.manifest.xml"
    And PowerPoint is told to load that manifest via the developer registry

  Scenario: Uninstall on Windows clears the registry entry and stored manifest
    Given the platform is "win32" and the home directory is "C:\Users\jo"
    And the manifest is already installed from "/pkg/manifest.prod.xml"
    When I uninstall
    Then the developer registry entry is gone
    And the manifest is no longer installed
    And uninstall reports that it was removed

  Scenario: A macOS-blocked install is explained, not dumped as a raw error
    Given the platform is "darwin" and the home directory is "/Users/jo"
    And creating the add-in folder is blocked by the system
    When I try to install the manifest from "/pkg/manifest.prod.xml"
    Then I am told it is a macOS permission restriction
    And the reported add-in folder is "/Users/jo/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef"

  Scenario Outline: The blocked-install fallback stages the manifest somewhere writable
    Given the home directory is "/Users/jo" and the temp directory is "/tmp"
    And Downloads <downloads>
    Then the manifest is staged to "<staged>"

    Examples:
      | downloads  | staged                                            |
      | exists     | /Users/jo/Downloads/power-prez-tools.manifest.xml |
      | is missing | /tmp/power-prez-tools.manifest.xml                |
