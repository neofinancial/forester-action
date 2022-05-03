import { setFailed } from '@actions/core';
import axios, { AxiosResponse } from 'axios';
import { inspect } from 'util';

import { getPresignedPost } from './get-presigned-post';

import { PullRequestData } from './get-pull-request-data';

type sendDataInput = {
  pullRequestData: PullRequestData;
  packageJson: string;
};

const sendData = async (data: sendDataInput): Promise<AxiosResponse> => {
  try {
    const { repositoryId, ref, pullRequest } = data.pullRequestData;
    const filename = encodeURIComponent(`${repositoryId}-#${pullRequest}-${ref}.json`);
    const url = await getPresignedPost(filename);

    return axios({
      method: 'put',
      url,
      data,
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
