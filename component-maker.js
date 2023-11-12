import chalk from 'chalk';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * @param {string} name is a pathname / component-name
 * @param {boolean} test should a test be generated
 * */
export function createComponent(name, test) {

  const pathSegments = name.split('/');

  const componentName = pathSegments[pathSegments.length - 1];
  const names = createComponentName(componentName);

  const componentFile = createComponentFile(names);

  let path = "";
  if (pathSegments.length > 1) {
    path = join(...pathSegments.slice(0, pathSegments.length - 1))
  }


  path = join(path, names.file_name);

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

}

/**
 * @param {string} name 
 */
function createComponentName(name) {
  if (!name.includes('-')) {
    throw Error("A webcomponent needs to contain a -");
  }

  const className = name.split('-')
    .map(segment => segment[0].toUpperCase() + segment.slice(1))
    .join("");


  const pascal = className[0].toLowerCase() + className.slice(1);
  const file_name = name.toLowerCase();

  return {
    name,
    pascal,
    file_name,
    className,
    styleFilename: `${file_name}.styles.scss`,
    componentFileName: `${file_name}.component.ts`,
    testFileName: `${file_name}.spec.ts`
  }
}


function createComponentFile(names) {
  return `import { html, LitElement, TemplateResult } from "lit";
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

function createTestFile(names) {
  return `import "./${names.pascal}.component";

describe("${names.name}", () => {
  it("${names.name}is registered", (done) => {
    window.customElements.whenDefined("${names.name}").then(() => {
      done();
    });
  });
});
`
}
