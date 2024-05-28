export const WEBPACK_DEV = `
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: [path.join(__dirname, "demo"), path.join(__dirname, "dist")],
    compress: true,
    port: 8080,
    historyApiFallback: true, // Handy for developing SPA's
  },
});
`;

export const WEBPACK_PROD = `
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/src\/config\/config.ts/, // src/main.ts
      "./src/config/config.prod.ts",
    ),
  ],
});
`;

export const WEBPACK_COMMON = `
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
        exclude: [/node_modules/],
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

`;

export const ESLINT_CONFIG_FILE = `
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];`;

export const KARMA_CONFIG_FILE = `
module.exports = (config) => {
  config.set({
    // ... normal karma configuration

    // make sure to include webpack as a framework
    frameworks: ["jasmine", "webpack"],
    reporters: ['mocha'],
    plugins: ["karma-webpack", "karma-jasmine", "karma-mocha-reporter", "karma-chrome-launcher"],

    files: [
      { pattern: "src/**/*.spec.ts", watched: false },
      //{ pattern: "src/**/*.test.ts", watched: false },
    ],
    browsers: ["ChromeHeadless"],
    preprocessors: {
      // add webpack as preprocessor
      "src/**/*.spec.ts": ["webpack" ],
      "src/**/*.test.ts": ["webpack" ],
    },
    logLevel: config.LOG_WARN,
    webpack: {
      stats: 'errors-only',
      devtool: 'inline-source-map',
      resolve: {
        extensions: [".ts", ".js"],
      },
      module: {
        rules: [
          {
            test: /\.ts?$/,
            use: "ts-loader",
            exclude: [/node_modules/],
          },
          {
            test: /\.css$|\.s(c|a)ss$/,
            use: ["lit-scss-loader", "sass-loader"],
          },
        ],
      },
    },
  });
};`;

export const TSCONFIG = `
{
  "compilerOptions": {
    "target": "es2020",
    "module": "es2020",
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "node",
    "rootDirs": [
      "src"
    ],
    "types": [
      "./node_modules/lit-scss-loader/types.d.ts",
      "jasmine"
    ],
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
  },
  "files": ["./src/index.ts"],
  "include": ["./node_modules/lit-scss-loader/types.d.ts"]
}`;
