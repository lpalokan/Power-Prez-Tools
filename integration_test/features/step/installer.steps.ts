import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { TestWorld } from "../../support/world";
import { Installer, wefDir } from "../../../src/cli/installer";

function installer(world: TestWorld): Installer {
  return new Installer(world.fakeFs, world.platform, world.home);
}

Given(
  /^the platform is "(.+)" and the home directory is "(.+)"$/,
  function (this: TestWorld, platform: string, home: string) {
    this.platform = platform;
    this.home = home;
  },
);

Given("the add-in folder does not exist", function (this: TestWorld) {
  // FakeFileSystem starts empty; nothing to do. Documents intent.
  assert.ok(!this.fakeFs.exists(wefDir(this.platform, this.home)));
});

Given(
  /^the manifest is already installed from "(.+)"$/,
  function (this: TestWorld, source: string) {
    installer(this).install(source);
  },
);

When("I resolve the add-in folder", function (this: TestWorld) {
  try {
    this.resolvedDir = wefDir(this.platform, this.home);
  } catch (e) {
    this.lastError = e as Error;
  }
});

When(
  /^I install the manifest from "(.+)"$/,
  function (this: TestWorld, source: string) {
    installer(this).install(source);
  },
);

When("I uninstall", function (this: TestWorld) {
  this.uninstalled = installer(this).uninstall();
});

Then(
  /^the add-in folder is "(.+)"$/,
  function (this: TestWorld, expected: string) {
    assert.strictEqual(this.resolvedDir, expected);
  },
);

Then("the add-in folder is created", function (this: TestWorld) {
  assert.ok(this.fakeFs.dirs.has(wefDir(this.platform, this.home)));
});

Then(
  /^the manifest is written to "(.+)"$/,
  function (this: TestWorld, expected: string) {
    assert.ok(this.fakeFs.files.has(expected));
  },
);

Then("the manifest is no longer installed", function (this: TestWorld) {
  assert.ok(!this.fakeFs.files.has(installer(this).targetPath()));
});

Then("uninstall reports that it was removed", function (this: TestWorld) {
  assert.strictEqual(this.uninstalled, true);
});

Then("uninstall reports that nothing was installed", function (this: TestWorld) {
  assert.strictEqual(this.uninstalled, false);
});

Then("I am told the platform is unsupported", function (this: TestWorld) {
  assert.ok(this.lastError, "expected an error");
  assert.match(this.lastError!.message, /unsupported platform/i);
});
