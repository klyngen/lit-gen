import { getProjectRoot } from "./config-reader"
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * @typedef PackageManifest
 * @property { Record<string, string> } dependencies
 * @property { Record<string, string> } devDependencies
 * @property { Record<string, string> } scripts
 * */

export const createOrUpdateProjectPackages = () => {
  console.log(chalk.blue('UPDATING DEPS  ') + chalk.gray('Should be done in a few seconds'));
  modifyPackageJson();
  createFiles();
  console.log(chalk.blue('COMPLETED ') + chalk.gray('Run yarn or npm i to complete update'));
}

const modifyPackageJson = () => {
  console.log(chalk.green('UPDATING  ') + chalk.gray('package.json'))
  const projectRoot = getProjectRoot();
  const packageFilePath = join(projectRoot, 'package.json');

  const packageFile =  readFileSync(packageFilePath, 'utf-8');

  /** @type {PackageManifest} */
  const packageFileContents = JSON.parse(packageFile);

  DEV_DEPS.forEach(dependency => {
      packageFileContents.devDependencies[dependency[0]] = dependency[1];
  });

  DEPS.forEach(dependency => {
      packageFileContents.dependencies[dependency[0]] = dependency[1];
  });

  SCRIPTS.forEach(script => {
    packageFileContents.scripts[script[0]] = script[1];
  });

  writeFileSync()
}

const createFiles = () => {
  const projectRoot = getProjectRoot();

  console.log(chalk.green('CREATING PROJECT CONFIGURATINO FILES'));

  CONFIG_FILES.forEach(configFile => {
    console.log(chalk.green('CREATING  ') + chalk.gray(configFile.name));
    writeFileSync(join(projectRoot, configFile.name), configFile.content);
  });

  NON_OVERWRITE_CONFIG_FILES.forEach(webpackConfiguration => {
    const filename = join(projectRoot, webpackConfiguration.name);
    if (existsSync(filename)) {
      return;
    }

    console.log(chalk.green('CREATING  ') + chalk.gray(webpackConfiguration.name));
    writeFileSync(filename, webpackConfiguration.content);
  });
}

const CONFIG_FILES = [
  {name: 'eslint.config.mjs', content: ESLINT_CONFIG_FILE},
  {name: 'karma.conf.js', content: KARMA_CONFIG_FILE}
];

const NON_OVERWRITE_CONFIG_FILES = [
  { name: 'webpack.common.js', content: WEBPACK_COMMON },
  { name: 'webpack.prod.js', content: WEBPACK_PROD },
  { name: 'webpack.dev.js', content: WEBPACK_DEV },
  { name: 'tsconfig.json', content: TSCONFIG }
];

const WEBPACK_DEV = `
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

const WEBPACK_PROD = `
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

const WEBPACK_COMMON = `
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

const ESLINT_CONFIG_FILE = `
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];`;


const KARMA_CONFIG_FILE = `
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
            test: /\.css|\.s(c|a)ss$/,
            use: ["lit-scss-loader", "sass-loader"],
          },
        ],
      },
    },
  });
};`;

const TSCONFIG = `
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


const SCRIPTS = [
    ["start", "webpack serve -c webpack.dev.js"],
    ["build", "webpack -c webpack.prod.js; cp -R ./src/assets dist/"],
    ["lint", "eslint src"],
    ["prettier", "prettier . --check"],
    ["prettier:fix", "prettier . --write"],
    ["test", "karma start --single-run"],
    ["test:watch", "karma start"],
    ["build:docker", "yarn; yarn build; docker build -t localhost/frontend:latest -f docker/Dockerfile ."],
];

const DEV_DEPS = [
    ["@eslint/js", "^9.2.0"],
    ["@open-wc/testing-helpers", "^3.0.1"],
    ["@types/jasmine", "^5.1.4"],
    ["dotenv-webpack", "^8.0.1"],
    ["eslint", "^9.2.0"],
    ["html-webpack-plugin", "^5.5.0"],
    ["jasmine", "^5.1.0"],
    ["karma", "^6.4.3"],
    ["karma-chrome-launcher", "^3.2.0"],
    ["karma-jasmine", "^5.1.0"],
    ["karma-mocha", "^2.0.1"],
    ["karma-mocha-reporter", "^2.2.5"],
    ["karma-webpack", "^5.0.1"],
    ["lit-scss-loader", "^2.0.1"],
    ["prettier", "3.2.5"],
    ["sass", "^1.76.0"],
    ["sass-loader", "^13.2.2"],
    ["ts-lit-plugin", "^2.0.1"],
    ["ts-loader", "^9.5.1"],
    ["typescript", "^5.4.5"],
    ["typescript-eslint", "^7.8.0"],
    ["webpack", "^5.91.0"],
    ["webpack-cli", "^5.1.4"],
    ["webpack-dev-server", "5.0.4"],
    ["webpack-merge", "^5.8.0"],
]

const DEPS = [
    ["lit", "^3.1.3"],
    ["rxjs", "^7.8.1"],
    ["@klingen/litworks", "^1.1.3"]
];
