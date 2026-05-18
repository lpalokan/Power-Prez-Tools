import { Cli } from "./cli";
import { NodeCliEnvironment } from "./nodeCliEnvironment";
import { NodeFileSystem } from "./nodeFileSystem";

/** Thin entrypoint: wire the Node adapters into the testable Cli runner. */
export function run(argv: string[]): void {
  new Cli(new NodeCliEnvironment(), new NodeFileSystem()).run(argv);
}
