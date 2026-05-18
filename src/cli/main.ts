import * as os from "os";
import * as path from "path";
import { Installer, UnsupportedPlatformError } from "./installer";
import { NodeFileSystem } from "./nodeFileSystem";

const HELP = `Power Prez Tools - PowerPoint add-in installer

Usage:
  npx power-prez-tools install      Register the add-in with PowerPoint
  npx power-prez-tools uninstall    Remove the add-in from PowerPoint
  npx power-prez-tools help         Show this help

After installing, fully quit and reopen PowerPoint. The buttons appear on
the Home tab in the "Power Prez Tools" group.`;

/** The production manifest shipped inside the published package. */
function bundledManifest(): string {
  // Compiled to lib/cli/main.js, so the package root is two levels up.
  return path.join(__dirname, "..", "..", "manifest.prod.xml");
}

export function run(argv: string[]): void {
  const command = (argv[0] ?? "help").toLowerCase();
  const installer = new Installer(new NodeFileSystem(), process.platform, os.homedir());

  try {
    switch (command) {
      case "install": {
        const target = installer.install(bundledManifest());
        console.log(`Installed the Power Prez Tools manifest to:\n  ${target}\n`);
        console.log("Now fully quit PowerPoint (Cmd+Q) and reopen it.");
        console.log('The buttons appear on the Home tab, in the "Power Prez Tools" group.');
        break;
      }
      case "uninstall": {
        const removed = installer.uninstall();
        console.log(
          removed
            ? "Removed the Power Prez Tools add-in. Restart PowerPoint to finish."
            : "Power Prez Tools was not installed; nothing to do.",
        );
        break;
      }
      case "help":
      case "--help":
      case "-h":
        console.log(HELP);
        break;
      default:
        console.error(`Unknown command "${command}".\n`);
        console.log(HELP);
        process.exitCode = 1;
    }
  } catch (e) {
    if (e instanceof UnsupportedPlatformError) {
      console.error(e.message);
    } else {
      console.error(`Failed to ${command}: ${(e as Error).message}`);
    }
    process.exitCode = 1;
  }
}
