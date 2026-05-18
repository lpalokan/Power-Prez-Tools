module.exports = {
  default: {
    require: [
      "integration_test/support/world.ts",
      "integration_test/support/harness.ts",
      "integration_test/features/step/**/*.ts",
    ],
    requireModule: ["ts-node/register"],
    paths: ["integration_test/features/**/*.feature"],
  },
};
