import { setFailed } from '@actions/core';
import axios from 'axios';
import { inspect } from 'util';

type UploadPackageInput = { url: string; data: string };

const uploadPackage = async ({ url, data }: UploadPackageInput): Promise<boolean> => {
  try {
    const response = await axios({
      method: 'put',
      url,
      data,
    });

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
