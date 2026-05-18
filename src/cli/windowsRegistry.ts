import { spawnSync } from "child_process";
import { RegistryPort } from "./installer";

/** Real Windows registry adapter (uses reg.exe). win32 only. */
export class WindowsRegistry implements RegistryPort {
  set(keyPath: string, name: string, data: string): void {
    const r = spawnSync(
      "reg",
      ["add", keyPath, "/v", name, "/t", "REG_SZ", "/d", data, "/f"],
      { stdio: "ignore" },
    );
    if (r.status !== 0) {
      throw new Error(
        `Failed to write the Windows registry value under ${keyPath}.`,
      );
    }
  }

  has(keyPath: string, name: string): boolean {
    const r = spawnSync("reg", ["query", keyPath, "/v", name], {
      stdio: "ignore",
    });
    return r.status === 0;
  }

  delete(keyPath: string, name: string): void {
    spawnSync("reg", ["delete", keyPath, "/v", name, "/f"], {
      stdio: "ignore",
    });
  }
}
