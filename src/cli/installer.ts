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

/** Filename the manifest is installed as (kept stable for clean uninstalls). */
export const MANIFEST_FILENAME = "power-prez-tools.manifest.xml";

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
    if (!this.fs.exists(dir)) this.fs.mkdirp(dir);
    const target = this.targetPath();
    this.fs.copy(manifestSource, target);
    return target;
  }

  /** Remove a previously installed manifest. Returns whether one existed. */
  uninstall(): boolean {
    const target = this.targetPath();
    if (!this.fs.exists(target)) return false;
    this.fs.remove(target);
    return true;
  }
}
