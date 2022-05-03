import { setFailed } from '@actions/core';
import fs from 'fs';

const getPackageJSON = async (): Promise<string> => {
  try {
    const manualPath = `${process.cwd()}/package.json`;

    const packageJSON = fs.readFileSync(manualPath, { encoding: 'utf8' });

    console.log('package.json:', packageJSON);

    return packageJSON;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(`Dependanot action unable to read package.json ${error.message}`);
    }

    throw new Error(`Could not read package.json: ${JSON.stringify(error)}`);
  }
};

export { getPackageJSON };
