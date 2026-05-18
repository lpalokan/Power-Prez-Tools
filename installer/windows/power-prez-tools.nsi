; Power Prez Tools - Windows installer (NSIS).
; Per-user (no admin): drops the production manifest under %LOCALAPPDATA%
; and points PowerPoint's developer-sideload registry value at it.
; Mirrors the npx CLI's Windows behavior (same key/value).

Unicode true
!include "MUI2.nsh"

!ifndef VERSION
  !define VERSION "0.0.0"
!endif
!ifndef VIPRODUCT
  !define VIPRODUCT "0.0.0.0"
!endif
!ifndef MANIFESTSRC
  !error "MANIFESTSRC must be defined (path to manifest.prod.xml)"
!endif
!ifndef OUTFILE
  !define OUTFILE "PowerPrezTools-Setup.exe"
!endif

!define DEVKEY "Software\Microsoft\Office\16.0\WEF\Developer"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\PowerPrezTools"
!define MANIFEST "power-prez-tools.manifest.xml"

Name "Power Prez Tools"
OutFile "${OUTFILE}"
InstallDir "$LOCALAPPDATA\PowerPrezTools"
RequestExecutionLevel user
ShowInstDetails show
ShowUninstDetails show

VIProductVersion "${VIPRODUCT}"
VIAddVersionKey "ProductName" "Power Prez Tools"
VIAddVersionKey "FileDescription" "Power Prez Tools PowerPoint add-in installer"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "LegalCopyright" "MIT"

!define MUI_WELCOMEPAGE_TITLE "Power Prez Tools for PowerPoint"
!define MUI_WELCOMEPAGE_TEXT "This registers the Power Prez Tools add-in with PowerPoint for your user account. No administrator rights are needed.$\r$\n$\r$\nAfter installing, fully close and reopen PowerPoint."
!define MUI_FINISHPAGE_TEXT "Done. Close and reopen PowerPoint, then look for the 'Power Prez Tools' group on the Home tab."
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File "/oname=${MANIFEST}" "${MANIFESTSRC}"

  WriteRegStr HKCU "${DEVKEY}" "PowerPrezTools" "$INSTDIR\${MANIFEST}"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "Power Prez Tools"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "Power Prez Tools"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  DeleteRegValue HKCU "${DEVKEY}" "PowerPrezTools"
  Delete "$INSTDIR\${MANIFEST}"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "${UNINSTKEY}"
SectionEnd
