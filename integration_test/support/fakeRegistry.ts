import { RegistryPort } from "../../src/cli/installer";

/** In-memory Windows registry for installer scenarios. */
export class FakeRegistry implements RegistryPort {
  readonly values = new Map<string, string>();

  private key(keyPath: string, name: string): string {
    return `${keyPath}::${name}`;
  }

  set(keyPath: string, name: string, data: string): void {
    this.values.set(this.key(keyPath, name), data);
  }

  has(keyPath: string, name: string): boolean {
    return this.values.has(this.key(keyPath, name));
  }

  delete(keyPath: string, name: string): void {
    this.values.delete(this.key(keyPath, name));
  }
}
