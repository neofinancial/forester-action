import { getInput } from '@actions/core';
import { context } from '@actions/github';

export type PullRequestData = {
  repositoryId: number;
  ref: string;
  baseRef: string;
  sha: string;
  actor: string;
  timestamp: string;
  token: string;
  pullRequest?: number;
};

const getPullRequestData = async (): Promise<PullRequestData> => {
  const authToken = getInput('dependanotToken');

  const pullRequestData: PullRequestData = {
    repositoryId: context.payload.repository?.id,
    ref: '',
    baseRef: '',
    sha: '',
    actor: '',
    timestamp: Date.now().toString(),
    token: authToken,
  };

  const info = context.payload;

  if (info.pull_request) {
    pullRequestData.ref = info.pull_request.head.ref;
    pullRequestData.baseRef = info.pull_request.base.ref;
    pullRequestData.sha = info.pull_request.head.sha;
    pullRequestData.timestamp = info.pull_request.created_at;
    pullRequestData.pullRequest = info.number;
  } else {
    pullRequestData.ref = info.ref.replace('refs/heads/', '');
    pullRequestData.baseRef = info.base_ref;
    pullRequestData.sha = info.after;
    pullRequestData.timestamp = info.head_commit.timestamp;
  }

  if (info.repository && info.sender) {
    pullRequestData.actor = info.sender.login;
  } else if (!info.repository && !info.sender) {
    throw new Error('repository and sender are undefined');
  } else if (!info.repository) {
    throw new Error('repository is undefined');
  } else {
    throw new Error('sender is undefined');
  }

  console.log('pullRequestData:', pullRequestData);

  return pullRequestData;
};

export { getPullRequestData };
