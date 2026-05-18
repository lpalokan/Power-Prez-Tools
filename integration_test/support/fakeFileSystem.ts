import { FileSystemPort } from "../../src/cli/installer";

/** In-memory filesystem for installer scenarios. */
export class FakeFileSystem implements FileSystemPort {
  readonly dirs = new Set<string>();
  readonly files = new Map<string, string>();

  exists(path: string): boolean {
    return this.dirs.has(path) || this.files.has(path);
  }

  mkdirp(path: string): void {
    this.dirs.add(path);
  }

  copy(source: string, destination: string): void {
    this.files.set(destination, source);
  }

  remove(path: string): void {
    this.files.delete(path);
  }
}
