import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const CONFIGURATION_FILE_NAME = "lit-gen.json";
const MAX_UPWARDS_TRAVERSAL = 15;

/**
 * @typedef Configuration
 * @prop {boolean} generateTestFile
 * @prop {boolean} generateIndexFile
 */


const makeCofigurationTemplateContent = () => {
  return `
{
  "generateTestFile": false,
  "generateIndexFile": false
}
  `;
}

export const writeConfigurationFile = () => {
  const projectRoot = getProjectRoot();
  if (!projectRoot) {
    return;
  }

  const configurationFilePath = join(projectRoot, CONFIGURATION_FILE_NAME);
  writeFileSync(configurationFilePath, makeCofigurationTemplateContent());
  console.log(chalk.green("CREATED") + chalk.grey(" lit-gen.json")); 
}

/**
 * @returns {Configuration | null}
 */
export const getProjectConfiguration = () => {
  const projectRoot = getProjectRoot();

  if (projectRoot === null) {
    return null;
  }

  const configurationFileName = join(projectRoot, CONFIGURATION_FILE_NAME);

  if (!existsSync(configurationFileName)) {
    return null;
  }

  try {

  const data = readFileSync(configurationFileName, { encoding: "utf8"})
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log(chalk.redBright(`Not able to read json in ${configurationFileName} due to error: ${error}`)); 
    }

  } catch(e) {
    console.log(chalk.redBright(`Not able to open ${configurationFileName} due to error: ${error}`)); 

  }
}

/**
 * @returns {string | null}
 */
const getProjectRoot = () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  let currentDir = __dirname
  let currentTraversal = 0;
  while(!existsSync(join(currentDir, "package.json"))) {
    currentDir = join(currentDir, '..');
    currentTraversal++;

    if (currentTraversal === MAX_UPWARDS_TRAVERSAL) {
      console.log(chalk.yellow("Not able to find project root")); 
      return null;
    }
  }


  return currentDir;
}
