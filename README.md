# Lit generator

A simple node-js script to make lit-components and simple service files

## What does this cli do

Generates scaffolding for a component with scss-styles. Does also make jest-capable tests. In many ways, this tool is very similar to the angular-cli

``` markdown
Usage: lit-gen [options] [command]

Tool for making lit-elements and services. Making a lit-project easy to build

Options:
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  component [options] <name>
  service [options] <name>
  help [command]              display help for command

```


## Usage

**Create a component**
`lit-gen component component-name`

**Create a component in a subdirectory**
`lit-gen component path/to/component-name`

**Create a service**
`lit-gen service service-name`

**Create a service in a subdirectory**
`lit-gen service path/to/service-name`


## Project setup for scss

Using a webpack similar to this wold work well

[This repo provides a good starting-ground](https://github.com/klyngen/typescript-template)


``` javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devServer: {
    historyApiFallback: true,
  },
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css|\.s(c|a)ss$/,
        use: ["lit-scss-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunksSortMode: "none",
      template: "src/index.html",
    }),
  ],
};
```

