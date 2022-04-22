import axios from 'axios';

import { PullRequestData } from './get-pull-request-data';

type PostJSON = {
  id: number;
  ref: string;
  baseRef: string;
  hash: string;
  actor: string;
  token: string;
  pullRequest?: number;
};

const sendDataComment = async (url: string, pullRequestData: PullRequestData): Promise<string> => {
  const postJson: PostJSON = {
    id: pullRequestData.repositoryId,
    ref: pullRequestData.ref,
    baseRef: pullRequestData.baseRef,
    hash: pullRequestData.sha,
    actor: pullRequestData.actor,
    token: pullRequestData.token,
  };

  if (pullRequestData.pullRequest) {
    postJson.pullRequest = pullRequestData.pullRequest;
  }

  try {
    const response = await axios.post(url, postJson, {
      headers: { responseType: 'comment' },
    });

    return response.data.message;
  } catch (error) {
    throw new Error(error);
  }
};

export { sendDataComment };
