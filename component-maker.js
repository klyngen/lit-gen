import chalk from 'chalk';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * @typedef ComponentNames
 * @property {string} name
 * @property {string} className
 * @property {string} styleFilename
 * @property {string} testFileName
 * @property {string} componentFileName
 *
 */


/**
 * @param {string} name is a pathname / component-name
 * @param {boolean} test should a test be generated
 * @param {boolean} index if true, we add an index-file to the project
 * */
export function createComponent(name, test, index) {

  const pathSegments = name.split('/');

  const componentName = pathSegments[pathSegments.length - 1];


  let path = "";
  if (pathSegments.length > 1) {
    path = join(...pathSegments.slice(0, pathSegments.length - 1))
  }

  const names = createComponentName(componentName);
  const componentFile = createComponentFile(names);


  path = join(path, names.name);

  mkdirSync(path, {
    recursive: true
  });


  const componentFilename = join(path, names.componentFileName)
  const stylesFilename = join(path, names.styleFilename)

  writeFileSync(componentFilename, componentFile);
  writeFileSync(stylesFilename, "");

  console.log(chalk.green('CREATED  ') + chalk.gray(componentFilename))
  console.log(chalk.green('CREATED  ') + chalk.gray(stylesFilename))

  if (test) {
    const testFile = createTestFile(names);
    const testFilePath = join(path, names.testFileName);

    writeFileSync(testFilePath, testFile);

    console.log(chalk.green('CREATED  ') + chalk.gray(testFilePath))
  }

  if (index) {
    const indexFileContent = createIndexWithReExportsFile(names);
    const indexFilePath = join(path, "index.ts");

    writeFileSync(indexFilePath, indexFileContent);
    console.log(chalk.green('CREATED  ') + chalk.gray(indexFilePath));
  }

}

/**
 * @param {string} name 
 * @returns {ComponentNames}
 */
function createComponentName(name) {
  if (!name.includes('-')) {
    throw Error("A webcomponent needs to contain a -");
  }

  const className = name.split('-')
    .map(segment => segment[0].toUpperCase() + segment.slice(1))
    .join("");


  return {
    name,
    className,
    styleFilename: `${name}.styles.scss`,
    componentFileName: `${name}.component.ts`,
    testFileName: `${name}.spec.ts`
  }
}

/**
 * @param {ComponentNames} names
 */
function createIndexWithReExportsFile(names) {
  return `
export { ${names.className} } from "./${names.componentFileName.replace(".ts", "")}";
  `;
}

/**
 * @param {ComponentNames} names
 */
function createComponentFile(names) {
  return `
import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import style from "./${names.styleFilename}";

@customElement("${names.name}")
export class ${names.className} extends LitElement {


  static styles = [style];

  render(): TemplateResult {
    return html\`${names.name}-component works\`;
  }
}`
}

/**
 * @param {ComponentNames} names
 */
function createTestFile(names) {
  return `
import "./${names.name}.component";

describe("${names.name}", () => {
  it("${names.name}is registered", (done) => {
    window.customElements.whenDefined("${names.name}").then(() => {
      done();
    });
  });
});
`
}
