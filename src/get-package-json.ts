import { setFailed } from '@actions/core';
import fs from 'fs';

const getPackageJSON = async (): Promise<Buffer> => {
  try {
    // console.log('path', path.join(process.cwd(), 'package.json'));

    const manualPath = `${process.cwd()}/package.json`;

    const packageJSON = fs.readFileSync(manualPath);

    console.log('packageJSON', packageJSON);

    return packageJSON;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(`Dependanot action unable to read package.json ${error.message}`);
    }

    throw new Error(`Could not read package.json: ${JSON.stringify(error)}`);
  }
};

export { getPackageJSON };
