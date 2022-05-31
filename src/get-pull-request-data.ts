import { context } from '@actions/github';

export type PullRequestData = {
  repositoryId: number;
  ref: string;
  baseRef: string;
  sha: string;
  actor: string;
  timestamp: string;
  pullRequest: number;
};

const getPullRequestData = async (): Promise<PullRequestData> => {
  const { number, pull_request, sender } = context.payload;

  if (!pull_request) {
    throw new Error('Pull request data not found');
  }

  if (!sender) {
    throw new Error('Sender data not found');
  }

  const pullRequestData = {
    repositoryId: context.payload.repository?.id,
    ref: pull_request.head.ref,
    baseRef: pull_request.base.ref,
    sha: pull_request.head.sha,
    actor: sender.login,
    timestamp: pull_request.created_at,
    pullRequest: number,
  };

  console.log('pullRequestData:', pullRequestData);

  return pullRequestData;
};

export { getPullRequestData };
