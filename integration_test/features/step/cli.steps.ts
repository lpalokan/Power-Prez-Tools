import { When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { TestWorld } from "../../support/world";
import { Cli } from "../../../src/cli/cli";
import { fallbackStagePath } from "../../../src/cli/installer";

function out(world: TestWorld): string {
  return world.cliEnv.stdout.join("\n");
}

function err(world: TestWorld): string {
  return world.cliEnv.stderr.join("\n");
}

When(/^I run the CLI with "(.+)"$/, function (this: TestWorld, command: string) {
  new Cli(this.cliEnv, this.fakeFs, this.fakeRegistry).run([command]);
});

Then("the CLI says the manifest was installed", function (this: TestWorld) {
  assert.match(out(this), /Installed the Power Prez Tools manifest to:/);
});

Then("the CLI says nothing was installed", function (this: TestWorld) {
  assert.match(out(this), /was not installed; nothing to do/);
});

Then("the CLI prints usage help", function (this: TestWorld) {
  assert.match(out(this), /Usage:/);
  assert.match(out(this), /npx power-prez-tools install/);
});

Then("the CLI says the platform is unsupported", function (this: TestWorld) {
  assert.match(err(this), /unsupported platform/i);
});

Then("the CLI exits successfully", function (this: TestWorld) {
  assert.strictEqual(this.cliEnv.failed, false);
});

Then("the CLI exits with a failure", function (this: TestWorld) {
  assert.strictEqual(this.cliEnv.failed, true);
});

Then(
  "the CLI staged the manifest where the user can reach it",
  function (this: TestWorld) {
    const expected = fallbackStagePath(
      this.home,
      this.tmpDir,
      this.downloadsExists,
    );
    assert.ok(
      this.cliEnv.copied.some((c) => c.destination === expected),
      `expected a copy to ${expected}, got ${JSON.stringify(this.cliEnv.copied)}`,
    );
  },
);

Then("the CLI revealed the staged manifest", function (this: TestWorld) {
  const expected = fallbackStagePath(
    this.home,
    this.tmpDir,
    this.downloadsExists,
  );
  assert.ok(this.cliEnv.revealed, "expected the staged manifest to be revealed");
  assert.strictEqual(this.cliEnv.revealed!.staged, expected);
});

Then(
  "the CLI explains the macOS permission restriction",
  function (this: TestWorld) {
    assert.match(err(this), /macOS|privacy restriction/i);
    assert.match(err(this), /Cmd\+Shift\+G/);
  },
);
