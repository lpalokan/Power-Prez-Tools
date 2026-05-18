import { FileSystemPort } from "../../src/cli/installer";

/** In-memory filesystem for installer scenarios. */
export class FakeFileSystem implements FileSystemPort {
  readonly dirs = new Set<string>();
  readonly files = new Map<string, string>();
  /** When true, mkdirp throws an OS permission error (macOS sandbox). */
  blockMkdir = false;

  exists(path: string): boolean {
    return this.dirs.has(path) || this.files.has(path);
  }

  mkdirp(path: string): void {
    if (this.blockMkdir) {
      const err = new Error(
        `EPERM: operation not permitted, mkdir '${path}'`,
      ) as Error & { code: string };
      err.code = "EPERM";
      throw err;
    }
    this.dirs.add(path);
  }

  copy(source: string, destination: string): void {
    this.files.set(destination, source);
  }

  remove(path: string): void {
    this.files.delete(path);
  }
}
