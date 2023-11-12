import chalk from 'chalk';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

/**
 * @param {string} name is a pathname / component-name
 * @param {boolean} test should a test be generated
 * */
export function createService(name, test) {
  const pathSegments = name.split('/');
  const serviceName = pathSegments[pathSegments.length - 1];

  console.log(name);

  let path = "";
  if (pathSegments.length > 1) {
    path = join(...pathSegments.slice(0, pathSegments.length - 1))
  }

  mkdirSync(path, {
    recursive: true
  });

  const names = createServiceNames(serviceName);

  const serviceFilename = join(path, names.serviceFileName);
  writeFileSync(serviceFilename, createServiceFile(names));
  console.log(chalk.blue('CREATED  ') + chalk.gray(serviceFilename))

  if (test) {
    const serviceTestFilename = join(path, names.testFileName);
    writeFileSync(serviceTestFilename, createServiceTestFile(names))
    console.log(chalk.blue('CREATED  ') + chalk.gray(serviceTestFilename))
  }
}

/**
 * @param {string} name
 * */
function createServiceNames(name) {
  name = name.toLowerCase();
  const className = name[0].toUpperCase() + name.slice(1) + 'Service';

  const pascal = className[0].toLowerCase() + className.slice(1);

  return {
    name,
    pascal,
    className,
    serviceFileName: `${name}.service.ts`,
    testFileName: `${name}.service.spec.ts`
  }
}


function createServiceFile(names) {
  return `
export class ${names.className} {

}

export const ${names.pascal} = new ${names.className}();
`;
}


function createServiceTestFile(names) {
  return `import { ${names.className} } from "./${names.pascal}.service";

describe("${names.className}", () => {
  it("Service created", () => {
    const service = new ${names.className}();
    expect(service).toBeTruthy();
  });
});`;
}
