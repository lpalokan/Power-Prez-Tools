const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const dev = argv.mode === "development";
  return {
    entry: "./src/taskpane/taskpane.ts",
    devtool: dev ? "source-map" : false,
    resolve: { extensions: [".ts", ".js"] },
    module: {
      rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
    },
    output: {
      filename: "taskpane.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/taskpane/taskpane.html",
        filename: "taskpane.html",
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/taskpane/taskpane.css", to: "taskpane.css" },
          { from: "assets", to: "assets" },
          { from: "manifest.xml", to: "manifest.xml" },
        ],
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, "dist"),
      server: "https",
      port: 3000,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  };
};
