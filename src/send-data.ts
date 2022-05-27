import { setFailed } from '@actions/core';
import axios, { AxiosResponse } from 'axios';
import { inspect } from 'util';

const sendData = async (url: string, pullRequestData: string): Promise<AxiosResponse> => {
  try {
    return axios({
      method: 'put',
      url,
      data: pullRequestData,
    });
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not upload file to S3');
  }
};

export { sendData };
