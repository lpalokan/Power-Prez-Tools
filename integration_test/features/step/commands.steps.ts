import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { TestWorld } from "../../support/world";

function assertMessage(world: TestWorld, pattern: RegExp): void {
  assert.ok(
    world.host.messages.some((m) => pattern.test(m)),
    `expected a message matching ${pattern}, got ${JSON.stringify(world.host.messages)}`,
  );
}

Given("this PowerPoint is too old for the add-in", function (this: TestWorld) {
  this.host.supported = false;
});

When("I run the copy command", function (this: TestWorld) {
  return this.runner.run((s) => s.capture());
});

When("I run the paste-both command", function (this: TestWorld) {
  return this.runner.run((s) => s.pasteBoth());
});

Then("I am shown a message to update PowerPoint", function (this: TestWorld) {
  assertMessage(this, /update PowerPoint/i);
});

Then(
  "I am shown a message that nothing has been captured yet",
  function (this: TestWorld) {
    assertMessage(this, /captured/i);
  },
);

Then(
  "I am shown a message that no shape is selected",
  function (this: TestWorld) {
    assertMessage(this, /no shape selected/i);
  },
);

Then("no message is shown", function (this: TestWorld) {
  assert.deepStrictEqual(this.host.messages, []);
});

Then("the command signals it is done", function (this: TestWorld) {
  assert.strictEqual(this.host.completedCount, 1);
});
