import axios from 'axios';

import { PRData } from './get-data';

type FooJson = {
  id: number;
  ref: string;
  baseRef: string;
  hash: string;
  actor: string;
  token: string;
  pullRequest?: number;
};

const sendDataComment = async (url: string, prData: PRData): Promise<string> => {
  const postData: FooJson = {
    id: prData.repositoryId,
    ref: prData.ref,
    baseRef: prData.baseRef,
    hash: prData.sha,
    actor: prData.actor,
    token: prData.token,
  };

  if (prData.pullRequest) {
    postData.pullRequest = prData.pullRequest;
  }

  try {
    const response = await axios.post(url, postData, {
      headers: { responseType: 'comment' },
    });

    return response.data.message;
  } catch (error) {
    throw new Error(error);
  }
};

export { sendDataComment };
