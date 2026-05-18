import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { TestWorld } from "../../support/world";

Given("an empty capture slot", function (this: TestWorld) {
  this.store.clear();
  this.lastError = null;
});

Given(
  /^a shape "(.+)" at left (\d+) top (\d+) width (\d+) height (\d+) is selected$/,
  function (this: TestWorld, id: string, l: string, t: string, w: string, h: string) {
    this.port.add(id, { left: +l, top: +t, width: +w, height: +h });
    this.port.select(id);
  },
);

Given("no shape is selected", function (this: TestWorld) {
  this.port.select();
});

Given("the command runtime restarts", function (this: TestWorld) {
  this.restartRuntime();
});

Given(
  /^shapes "(.+)" and "(.+)" are both selected$/,
  function (this: TestWorld, a: string, b: string) {
    if (!this.port.shapes.has(a)) this.port.add(a, { left: 0, top: 0, width: 1, height: 1 });
    if (!this.port.shapes.has(b)) this.port.add(b, { left: 0, top: 0, width: 1, height: 1 });
    this.port.select(a, b);
  },
);

async function safely(world: TestWorld, op: () => Promise<void>): Promise<void> {
  try {
    await op();
  } catch (e) {
    world.lastError = e as Error;
  }
}

When("I capture position and dimensions", function (this: TestWorld) {
  return safely(this, () => this.service.capture());
});

When("I paste position", function (this: TestWorld) {
  return safely(this, () => this.service.pastePosition());
});

When("I paste dimensions", function (this: TestWorld) {
  return safely(this, () => this.service.pasteDimensions());
});

When("I paste both", function (this: TestWorld) {
  return safely(this, () => this.service.pasteBoth());
});

Then(
  /^the capture slot holds left (\d+) top (\d+) width (\d+) height (\d+)$/,
  function (this: TestWorld, l: string, t: string, w: string, h: string) {
    assert.deepStrictEqual(this.store.get(), {
      left: +l,
      top: +t,
      width: +w,
      height: +h,
    });
  },
);

Then(
  /^shape "(.+)" is at left (\d+) top (\d+) width (\d+) height (\d+)$/,
  function (this: TestWorld, id: string, l: string, t: string, w: string, h: string) {
    assert.deepStrictEqual(this.port.shapes.get(id), {
      left: +l,
      top: +t,
      width: +w,
      height: +h,
    });
  },
);

Then("the capture slot is empty", function (this: TestWorld) {
  assert.ok(this.store.isEmpty, "expected the capture slot to be empty");
});

Then("I am told nothing has been captured yet", function (this: TestWorld) {
  assert.ok(this.lastError, "expected an error");
  assert.match(this.lastError!.message, /captured/i);
});

Then("I am told no shape is selected", function (this: TestWorld) {
  assert.ok(this.lastError, "expected an error");
  assert.match(this.lastError!.message, /no shape selected/i);
});

Then("I am told to select exactly one shape", function (this: TestWorld) {
  assert.ok(this.lastError, "expected an error");
  assert.match(this.lastError!.message, /exactly one/i);
});
