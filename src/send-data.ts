import { setFailed } from '@actions/core';
import axios from 'axios';
// import FormData from 'form-data';

import { getPresignedPost } from './get-presigned-post';

import { PullRequestData } from './get-pull-request-data';

type sendDataInput = {
  pullRequestData: PullRequestData;
  packageJson: Buffer;
};

const sendData = async (input: sendDataInput): Promise<string | void> => {
  const { repositoryId, sha, timestamp } = input.pullRequestData;

  const filename = encodeURIComponent(`${repositoryId}-${sha}-${timestamp}`);

  try {
    const { url } = await getPresignedPost(filename);

    // const formData = new FormData();

    // Object.entries({ ...fields, file }).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });

    // await fetch(url, {
    //   method: 'POST',
    //   // mode: 'no-cors',
    //   body: JSON.stringify(postJson),
    // });

    return axios.put(url, input);
  } catch (error) {
    setFailed(`Dependanot action failed to run: ${JSON.stringify(error)}`);
  }
};

export { sendData };
