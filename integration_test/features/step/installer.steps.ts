import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { TestWorld } from "../../support/world";
import {
  Installer,
  addinFolder,
  PermissionDeniedError,
  fallbackStagePath,
  winManifestPath,
  WIN_DEVELOPER_KEY,
  WIN_VALUE_NAME,
} from "../../../src/cli/installer";

function installer(world: TestWorld): Installer {
  return new Installer(
    world.fakeFs,
    world.fakeRegistry,
    world.platform,
    world.home,
  );
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
  assert.ok(!this.fakeFs.exists(addinFolder(this.platform, this.home)));
});

Given(
  /^the manifest is already installed from "(.+)"$/,
  function (this: TestWorld, source: string) {
    installer(this).install(source);
  },
);

When("I resolve the add-in folder", function (this: TestWorld) {
  try {
    this.resolvedDir = addinFolder(this.platform, this.home);
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
  assert.ok(this.fakeFs.dirs.has(addinFolder(this.platform, this.home)));
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

Given("creating the add-in folder is blocked by the system", function (this: TestWorld) {
  this.fakeFs.blockMkdir = true;
});

When(
  /^I try to install the manifest from "(.+)"$/,
  function (this: TestWorld, source: string) {
    try {
      installer(this).install(source);
    } catch (e) {
      this.lastError = e as Error;
    }
  },
);

Then("I am told it is a macOS permission restriction", function (this: TestWorld) {
  assert.ok(this.lastError, "expected an error");
  assert.ok(
    this.lastError instanceof PermissionDeniedError,
    "expected a PermissionDeniedError",
  );
  assert.match(this.lastError!.message, /macOS|privacy restriction/i);
});

Then(
  /^the reported add-in folder is "(.+)"$/,
  function (this: TestWorld, expected: string) {
    assert.ok(this.lastError instanceof PermissionDeniedError);
    assert.strictEqual(
      (this.lastError as PermissionDeniedError).wefDir,
      expected,
    );
  },
);

Given(
  /^the home directory is "(.+)" and the temp directory is "(.+)"$/,
  function (this: TestWorld, home: string, tmp: string) {
    this.home = home;
    this.tmpDir = tmp;
  },
);

Given(/^Downloads (exists|is missing)$/, function (this: TestWorld, state: string) {
  this.downloadsExists = state === "exists";
});

Then(
  /^the manifest is staged to "(.+)"$/,
  function (this: TestWorld, expected: string) {
    const staged = fallbackStagePath(this.home, this.tmpDir, this.downloadsExists);
    assert.strictEqual(staged, expected);
  },
);

Then(
  "PowerPoint is told to load that manifest via the developer registry",
  function (this: TestWorld) {
    assert.strictEqual(
      this.fakeRegistry.values.get(`${WIN_DEVELOPER_KEY}::${WIN_VALUE_NAME}`),
      winManifestPath(this.home),
    );
  },
);

Then("the developer registry entry is gone", function (this: TestWorld) {
  assert.ok(!this.fakeRegistry.has(WIN_DEVELOPER_KEY, WIN_VALUE_NAME));
});
