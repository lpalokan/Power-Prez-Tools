import * as fs from "fs";
import { FileSystemPort } from "./installer";

/** Real filesystem adapter used by the CLI. */
export class NodeFileSystem implements FileSystemPort {
  exists(path: string): boolean {
    return fs.existsSync(path);
  }

  mkdirp(path: string): void {
    fs.mkdirSync(path, { recursive: true });
  }

  copy(source: string, destination: string): void {
    fs.copyFileSync(source, destination);
  }

  remove(path: string): void {
    fs.rmSync(path, { force: true });
  }
}
