/** Pure install logic. The filesystem is injected so it is testable. */

export type Platform = "darwin" | "win32" | string;

/** Minimal filesystem surface the installer needs. */
export interface FileSystemPort {
  exists(path: string): boolean;
  mkdirp(path: string): void;
  copy(source: string, destination: string): void;
  remove(path: string): void;
}

export class UnsupportedPlatformError extends Error {}

/**
 * macOS blocks command-line processes from writing into another app's
 * protected container unless the terminal has Full Disk Access. Finder is
 * allowed, so we recover by guiding the user through a one-drag manual step.
 */
export class PermissionDeniedError extends Error {
  constructor(
    readonly wefDir: string,
    readonly manifestSource: string,
  ) {
    super(
      "macOS blocked writing into PowerPoint's protected folder:\n" +
        `  ${wefDir}\n` +
        "This is a macOS privacy restriction, not a problem with the tool.",
    );
  }
}

/** Whether a caught filesystem error is an OS permission denial. */
export function isPermissionError(e: unknown): boolean {
  const code = (e as { code?: string }).code;
  if (code === "EPERM" || code === "EACCES") return true;
  return /EPERM|EACCES|not permitted|permission denied/i.test(
    String((e as Error)?.message ?? ""),
  );
}

/** Filename the manifest is installed as (kept stable for clean uninstalls). */
export const MANIFEST_FILENAME = "power-prez-tools.manifest.xml";

/** A writable place to drop the manifest when the wef folder is blocked. */
export function fallbackStagePath(
  home: string,
  tmpDir: string,
  downloadsExists: boolean,
): string {
  return downloadsExists
    ? `${home}/Downloads/${MANIFEST_FILENAME}`
    : `${tmpDir}/${MANIFEST_FILENAME}`;
}

/** Step-by-step manual install instructions for the blocked case. */
export function manualInstallSteps(wefDir: string, stagedManifest: string): string {
  return [
    "To finish the install without changing any system settings:",
    "",
    `  1. The manifest has been saved to:\n       ${stagedManifest}`,
    "  2. In Finder press Cmd+Shift+G and go to:",
    `       ${wefDir.slice(0, wefDir.lastIndexOf("/"))}`,
    '  3. Create a folder named "wef" there if it does not exist.',
    `  4. Move the saved manifest into that "wef" folder.`,
    "  5. Fully quit PowerPoint (Cmd+Q) and reopen it.",
    "",
    "Alternatively, grant your terminal Full Disk Access (System Settings →",
    "Privacy & Security → Full Disk Access), reopen the terminal, and re-run",
    "npx power-prez-tools install.",
  ].join("\n");
}

/** The folder PowerPoint reads sideloaded add-in manifests from. */
export function wefDir(platform: Platform, home: string): string {
  switch (platform) {
    case "darwin":
      return `${home}/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef`;
    case "win32":
      return `${home}\\AppData\\Local\\Microsoft\\Office\\16.0\\Wef`;
    default:
      throw new UnsupportedPlatformError(
        `Unsupported platform "${platform}". Power Prez Tools can be installed automatically on macOS and Windows; on other systems copy the manifest into PowerPoint's wef folder manually.`,
      );
  }
}

export class Installer {
  constructor(
    private readonly fs: FileSystemPort,
    private readonly platform: Platform,
    private readonly home: string,
  ) {}

  /** Absolute path the manifest is (or would be) installed to. */
  targetPath(): string {
    const dir = wefDir(this.platform, this.home);
    const sep = this.platform === "win32" ? "\\" : "/";
    return `${dir}${sep}${MANIFEST_FILENAME}`;
  }

  /** Copy the manifest into the wef folder, creating it if needed. */
  install(manifestSource: string): string {
    const dir = wefDir(this.platform, this.home);
    try {
      if (!this.fs.exists(dir)) this.fs.mkdirp(dir);
      const target = this.targetPath();
      this.fs.copy(manifestSource, target);
      return target;
    } catch (e) {
      if (isPermissionError(e)) {
        throw new PermissionDeniedError(dir, manifestSource);
      }
      throw e;
    }
  }

  /** Remove a previously installed manifest. Returns whether one existed. */
  uninstall(): boolean {
    const target = this.targetPath();
    if (!this.fs.exists(target)) return false;
    this.fs.remove(target);
    return true;
  }
}
