import { context } from '@actions/github';

import { PullRequestData } from './setup-pull-request';

const getPullRequestData = async (): Promise<PullRequestData> => {
  const { after, base_ref, number, pull_request, sender, ref, repository, head_commit } = context.payload;

  const setupPullRequestInput: PullRequestData = {
    repositoryId: repository?.id.toString(),
    ref: pull_request?.head.ref || ref.replace('refs/heads/', ''),
    baseRef: pull_request?.base.ref || base_ref || '',
    sha: pull_request?.head.sha || after,
    actor: sender?.login || 'github',
    timestamp: pull_request?.created_at || head_commit.timestamp,
    pullRequest: number || 0,
    repositoryName: repository?.name
  };

  console.log('setupPullRequestInput:', setupPullRequestInput);

  return setupPullRequestInput;
};

export { getPullRequestData };
