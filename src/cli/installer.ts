/** Pure install logic. Filesystem and registry are injected so it is testable. */

export type Platform = "darwin" | "win32" | string;

/** Minimal filesystem surface the installer needs. */
export interface FileSystemPort {
  exists(path: string): boolean;
  mkdirp(path: string): void;
  copy(source: string, destination: string): void;
  remove(path: string): void;
}

/** Minimal Windows registry surface (used only on win32). */
export interface RegistryPort {
  set(keyPath: string, name: string, data: string): void;
  has(keyPath: string, name: string): boolean;
  delete(keyPath: string, name: string): void;
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

/** Windows per-user developer sideload registry key and value name. */
export const WIN_DEVELOPER_KEY =
  "HKCU\\Software\\Microsoft\\Office\\16.0\\WEF\\Developer";
export const WIN_VALUE_NAME = "PowerPrezTools";

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

/** Step-by-step manual install instructions for the macOS-blocked case. */
export function manualInstallSteps(wefDir: string, stagedManifest: string): string {
  return [
    "To finish the install without changing any system settings:",
    "",
    `  1. The manifest has been saved to:\n       ${stagedManifest}`,
    "  2. In Finder press Cmd+Shift+G and go to:",
    `       ${wefDir.slice(0, wefDir.lastIndexOf("/"))}`,
    '  3. Create a folder named "wef" there if it does not exist.',
    '  4. Move the saved manifest into that "wef" folder.',
    "  5. Fully quit PowerPoint (Cmd+Q) and reopen it.",
    "",
    "Alternatively, grant your terminal Full Disk Access (System Settings →",
    "Privacy & Security → Full Disk Access), reopen the terminal, and re-run",
    "npx power-prez-tools install.",
  ].join("\n");
}

/** macOS folder PowerPoint reads sideloaded add-in manifests from. */
export function macWefDir(home: string): string {
  return `${home}/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef`;
}

/** Windows folder where we keep the manifest the registry points at. */
export function winManifestDir(home: string): string {
  return `${home}\\AppData\\Local\\PowerPrezTools`;
}

export function winManifestPath(home: string): string {
  return `${winManifestDir(home)}\\${MANIFEST_FILENAME}`;
}

/** The add-in folder for "resolve" — macOS/Windows only, else unsupported. */
export function addinFolder(platform: Platform, home: string): string {
  switch (platform) {
    case "darwin":
      return macWefDir(home);
    case "win32":
      return winManifestDir(home);
    default:
      throw new UnsupportedPlatformError(
        `Unsupported platform "${platform}". Power Prez Tools can be installed automatically on macOS and Windows; on other systems copy the manifest into PowerPoint's add-in folder manually.`,
      );
  }
}

export class Installer {
  constructor(
    private readonly fs: FileSystemPort,
    private readonly registry: RegistryPort,
    private readonly platform: Platform,
    private readonly home: string,
  ) {}

  /** Absolute path the manifest is (or would be) installed to. */
  targetPath(): string {
    switch (this.platform) {
      case "darwin":
        return `${macWefDir(this.home)}/${MANIFEST_FILENAME}`;
      case "win32":
        return winManifestPath(this.home);
      default:
        return addinFolder(this.platform, this.home); // throws
    }
  }

  /** Register the add-in with PowerPoint. Returns the manifest's path. */
  install(manifestSource: string): string {
    switch (this.platform) {
      case "darwin":
        return this.installMac(manifestSource);
      case "win32":
        return this.installWindows(manifestSource);
      default:
        return addinFolder(this.platform, this.home); // throws Unsupported
    }
  }

  /** Remove a previous install. Returns whether one existed. */
  uninstall(): boolean {
    switch (this.platform) {
      case "darwin": {
        const target = this.targetPath();
        if (!this.fs.exists(target)) return false;
        this.fs.remove(target);
        return true;
      }
      case "win32": {
        const existed =
          this.registry.has(WIN_DEVELOPER_KEY, WIN_VALUE_NAME) ||
          this.fs.exists(winManifestPath(this.home));
        this.registry.delete(WIN_DEVELOPER_KEY, WIN_VALUE_NAME);
        if (this.fs.exists(winManifestPath(this.home))) {
          this.fs.remove(winManifestPath(this.home));
        }
        return existed;
      }
      default:
        return Boolean(addinFolder(this.platform, this.home)); // throws
    }
  }

  private installMac(manifestSource: string): string {
    const dir = macWefDir(this.home);
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

  private installWindows(manifestSource: string): string {
    const dir = winManifestDir(this.home);
    if (!this.fs.exists(dir)) this.fs.mkdirp(dir);
    const target = winManifestPath(this.home);
    this.fs.copy(manifestSource, target);
    this.registry.set(WIN_DEVELOPER_KEY, WIN_VALUE_NAME, target);
    return target;
  }
}
