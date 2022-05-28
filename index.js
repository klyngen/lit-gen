#! /usr/bin/env node

import chalk from 'chalk';
import { program, Command, Argument } from 'commander';
import { createComponent } from './component-maker.js';
import { createService } from './service-maker.js';

program.version("2.0.0")
  .description("Tool for making lit-elements and services. Making a lit-project easy to build")


program.command('component <name>')
  .option("-t|--test", "Generate unit-test", false)
  .action((name, options) => {
    if (!name.includes('-')) {
      console.log(chalk.red('ERROR: ') + chalk.white('A component-name needs to have at least one "-"'));
      return;
    }
    createComponent(name, options.test);
  });



program
  .command('service <name>')
  .option("-t|--test", "Generate unit-test", false)
  .action((name, options) => {
    createService(name, options.test)
  });


program.parse();

