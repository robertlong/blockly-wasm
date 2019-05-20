const path = require("path");
const HTMLWebpackPlugin =  require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  devServer: {
    contentBase: [
      path.join(__dirname,"node_modules", "pxt-blockly"),
      path.resolve(__dirname, "dist")
    ]
  },
  plugins: [new HTMLWebpackPlugin({
    template: path.resolve(__dirname, "src", "index.html")
  })],
  target: "web",
  node: {
    __dirname: false,
    fs: "empty",
    Buffer: false,
    process: false
  }
};
