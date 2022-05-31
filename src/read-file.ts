import { setFailed } from '@actions/core';
import fs from 'fs';

const readFile = async (fileName: string): Promise<string> => {
  try {
    const path = `${process.cwd()}/${fileName}`;

    return fs.readFileSync(path, { encoding: 'utf8' });
  } catch (error) {
    if (error instanceof Error) {
      setFailed(`Dependanot action unable to read ${fileName} ${error.message}`);
    }

    throw new Error(`Could not read ${fileName}: ${JSON.stringify(error)}`);
  }
};

export { readFile };
