#! /usr/bin/env node

import chalk from "chalk";
import { program } from "commander";
import { createComponent } from "./component-maker.js";
import { createService } from "./service-maker.js";
import {
    createInitialFiles,
  getProjectConfiguration,
  writeConfigurationFile,
} from "./config-reader.js";
import { createOrUpdateProjectPackages } from "./project-initialiser.js";

program
  .version("3.2.1")
  .description(
    "Tool for making lit-elements and services. Making a lit-project easy to build",
  );

const configuration = getProjectConfiguration();

program
  .command("component <name>")
  .option("-t|--test", "Generate unit-test", false)
  .option("-i|--index", "Generate index.ts file with re export", false)
  .action((name, options) => {
    if (!name.includes("-")) {
      console.log(
        chalk.red("ERROR: ") +
          chalk.white('A component-name needs to have at least one "-"'),
      );
      return;
    }
    createComponent(
      name,
      options.test || configuration?.generateTestFile,
      options.index || configuration?.generateIndexFile,
    );
  });

program
  .command("init")
  .description("generates a configuration-file in the project root")
  .action(() => {
    writeConfigurationFile();
    createOrUpdateProjectPackages();
    createInitialFiles();
  });

program
  .command("update")
  .description("generates a configuration-file in the project root")
  .action(() => {
    createOrUpdateProjectPackages();
  });

program
  .command("service <name>")
  .option("-t|--test", "Generate unit-test", false)
  .action((name, options) => {
    createService(name, options.test);
  });

program.parse();
