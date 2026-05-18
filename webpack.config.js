const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const devCerts = require("office-addin-dev-certs");

module.exports = async (env, argv) => {
  const dev = argv.mode === "development";
  const serving = process.env.WEBPACK_SERVE === "true";
  const httpsOptions = serving ? await devCerts.getHttpsServerOptions() : null;
  return {
    entry: "./src/commands/commands.ts",
    devtool: dev ? "source-map" : false,
    resolve: { extensions: [".ts", ".js"] },
    module: {
      rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
    },
    output: {
      filename: "commands.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/commands/commands.html",
        filename: "commands.html",
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/dialog/dialog.html", to: "dialog.html" },
          { from: "assets", to: "assets" },
          { from: "manifest.xml", to: "manifest.xml" },
        ],
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, "dist"),
      server: httpsOptions
        ? {
            type: "https",
            options: {
              key: httpsOptions.key,
              cert: httpsOptions.cert,
              ca: httpsOptions.ca,
            },
          }
        : "https",
      port: 3000,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  };
};
