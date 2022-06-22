import { setFailed } from '@actions/core';
import axios from 'axios';
import { inspect } from 'util';
import fs from 'fs';

type UploadPackageInput = { url: string; fileName: string };

const uploadPackage = async ({ url, fileName }: UploadPackageInput): Promise<boolean> => {
  try {
    const path = `${process.cwd()}/${fileName}`;
    const file = fs.readFileSync(path);
    const response = await axios.put(url, file);

    return response.status === 200;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not upload file to S3');
  }
};

export { uploadPackage };
